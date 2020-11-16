const axios = require('axios');
const config = require('../config');

const TeamsMessage = async ({ success, message, color, code }) => {
	const request = {
		'@type': 'MessageCard',
		'@context': 'http://schema.org/extensions',
		themeColor: color,
		summary: message,
		sections: [
			{
				activityTitle: message,
				activitySubtitle: 'Reported by the ICA Pre Approval Website',
				facts: [
					{
						name: 'Message',
						value: code
					}
				],
				markdown: true
			}
		],
		potentialAction: [
			{
				'@type': 'OpenUri',
				name: 'View on ICA',
				targets: [
					{
						os: 'default',
						uri: 'https://uaeentry.ica.gov.ae'
					}
				]
			}
		]
	};

	const url = success ? config.SuccessTeamsURL : config.FailureTeamsURL;

	const response = await axios.post(url, request, {
		headers: {
			'Content-Type': 'application/json'
		}
	});

	return response;
};

module.exports = TeamsMessage;
