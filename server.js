const cron = require('node-cron');
const initScrapping = require('./entry');

initScrapping();

cron.schedule('*/5 * * * *', () => {
	console.log('Running Scrapping');
	initScrapping();
});
