const os = require('os');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const config = require('./config');
const reCaptcha = require('./helpers/reCaptcha');
const SendSMS = require('./helpers/twilio');

puppeteer.use(StealthPlugin());

const initScrapping = () => {
	puppeteer
		.launch({
			headless: true,
			chromeWebSecurity: false,
			args: ['--no-sandbox', '--disable-web-security', '--disable-features=site-per-process']
		})
		.then(async browser => {
			console.log('Browser Initialized');
			await ICA_WEBPAGE(browser);
		});
};

const ICA_WEBPAGE = async browser => {
	const page = await browser.newPage();

	const url =
		'https://smartservices.ica.gov.ae/echannels/web/client/guest/index.html#/residents-entry-confirmation';

	await page.goto(url);

	console.log('Website Loaded');

	await InputField(page, 'input[name="identityNumber"]', config.EIDNumber);

	await InputField(page, 'input[name="passportNo"]', config.PassportNumber);

	await InputField(page, '[select-datasource="passportTypes"] input', '1');

	await InputField(page, '[select-datasource="nationalities"] input', '205');

	console.log('Field Data Entered');

	await reCaptcha(page);

	console.log('reCaptcha Solved');

	await page.$eval('button[ng-click="validateData()"]', elem => elem.click());

	console.log('Button Clicked');

	const finalResponse = await page.waitForResponse(
		'https://smartservices.ica.gov.ae/echannels/api/api/guest/draft/resident/entryPermission/check',
		{ timeout: 0 }
	);

	console.log('Response Received');

	const response = await finalResponse.json();

	console.log('Response Parsed');

	if (response.isSuccess) {
		if (response.data.isAuto) {
			console.warn('Entry Approved!');

			await page.screenshot({
				// path: `${os.homedir()}\\Desktop\\success.png`,
				// path: `C:\\Users\\LaveshPanjwani\\Desktop\\success.png`,
				path: `approved.png`,
				fullPage: true
			});

			SendSMS({ success: true });

			await browser.close();
		} else {
			console.warn('Entry Denied!');

			await page.screenshot({
				// path: `${os.homedir()}\\Documents\\failure.png`,
				// path: `C:\\Users\\LaveshPanjwani\\Documents\\failure.png`,
				path: `denied.png`,
				fullPage: true
			});

			await browser.close();
		}
	} else {
		console.error('Request Failure!');

		await page.screenshot({
			// path: `${os.homedir()}\\Documents\\failure.png`,
			// path: `C:\\Users\\LaveshPanjwani\\Documents\\failure.png`,
			path: `failure.png`,
			fullPage: true
		});

		await browser.close();
	}
};

const InputField = async (page, selector, value) => {
	await page.waitForSelector(selector, {
		visible: true
	});
	await page.focus(selector);
	await page.keyboard.type(value, { delay: 10 });
	await page.$eval(selector, e => {
		e.scrollIntoView({ behavior: 'smooth', block: 'center' });
	});
	await page.$eval(selector, e => e.blur());
};

module.exports = initScrapping;
