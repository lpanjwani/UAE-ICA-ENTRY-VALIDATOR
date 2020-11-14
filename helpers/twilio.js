require("dotenv").config();

const twilio = require("twilio");
const client = new twilio(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_ACCOUNT_SECRET
);
const config = require("../config");

let MESSAGES_SENT = false;

const SendSMS = ({ success }) => {
	if (MESSAGES_SENT) return false;

	client.messages
		.create({
			body: success
				? "Approval Successfully Received (Green) - GTG"
				: "Approval Failed (Red) - STOP",
			to: config.PhoneNumber,
			from: process.env.TWILIO_PHONE_NUMBER,
		})
		.then((message) => {
			console.warn("Sent Message ID" + message.sid);
			MESSAGES_SENT = true;
		})
		.catch((err) => {
			console.error("SMS Sending Failed");
			console.error(err);
		});
};

module.exports = SendSMS;
