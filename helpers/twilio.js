require('dotenv').config();

const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_SECRET);
const config = require('../config');

let MESSAGES_SENT = false;

const SendSMS = ({ success, message }) => {
	if (MESSAGES_SENT) return false;

	client.messages
		.create({
			body: message,
			to: config.PhoneNumber,
			from: process.env.TWILIO_PHONE_NUMBER
		})
		.then(sms => {
			console.warn('Sent Message ID' + sms.sid);
			MESSAGES_SENT = true;
		})
		.catch(err => {
			console.error('SMS Sending Failed');
			console.error(err);
		});
};

module.exports = SendSMS;
