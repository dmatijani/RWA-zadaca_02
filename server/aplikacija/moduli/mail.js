const nodemailer = require('nodemailer');

let mailer = nodemailer.createTransport({
    host: 'mail.foi.hr',
    port: 465,
	secure: true
})

exports.posaljiMail = async function(salje, prima, predmet, poruka){
	message = {
		from: salje,
		to: prima,
		subject: predmet,
		text: poruka
	}

	try {
		let odgovor = await mailer.sendMail(message);
		console.log(odgovor);
	} catch (e) {
		console.log(e);
	}
}
