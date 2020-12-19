const cron = require('node-cron');
const initScrapping = require('./entry');

initScrapping();

cron.schedule('*/15 * * * *', () => {
	console.log('Running Scrapping');
	initScrapping();
});
