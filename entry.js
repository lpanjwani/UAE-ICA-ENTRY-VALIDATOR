const config = require('./config');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const reCaptcha = require('./helpers/reCaptcha');
const SendSMS = require('./helpers/twilio');
const TeamsNotify = require('./helpers/teams');

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
			await browser.close();
			console.log('Browser Closed');
		})
		.catch(err => {
			console.error(err);

			TeamsNotify({
				isError: true,
				message: 'Puppeteer Error Occurred',
				color: '#FF0000',
				code: err.message
			});
		});
};

const ICA_WEBPAGE = async browser => {
	const page = await browser.newPage();

	await page.setCacheEnabled(false);

	const url = 'https://uaeentry.ica.gov.ae';

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
		{
			timeout: 60000
		}
	);

	console.log('Response Received');

	const response = await finalResponse.json();

	console.log('Response Parsed');

	if (response.isSuccess) {
		if (response.data.isAuto) {
			console.warn('Entry Approved!');

			await page.screenshot({
				path: `approved.png`,
				fullPage: true
			});

			await SendSMS({
				success: true,
				message: 'Approval Successfully Received (Green) - GTG',
				color: '#008000'
			});

			await TeamsNotify({
				isSuccess: true,
				message: 'Approval Successfully Received (Green) - GTG',
				color: '#008000',
				code: response.data.code
			});
		} else {
			console.warn(`Entry Denied (${response.data.code})`);

			await page.screenshot({
				path: `denied.png`,
				fullPage: true
			});

			await TeamsNotify({
				isSuccess: false,
				message: 'STOP - Approval Failed',
				color: '#FF0000',
				code: response.data.code
			});
		}

		await page.close();
	} else {
		await page.close();

		throw new Error('Request Failure');
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
