const cron = require('node-cron');
const initScrapping = require('./entry');

initScrapping();

cron.schedule('*/10 * * * *', () => {
	console.log('Running Scrapping');
	initScrapping();
});
