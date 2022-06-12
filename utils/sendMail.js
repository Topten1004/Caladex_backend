let nodemailer = require('nodemailer');

let mailerConfig = {    
    host: "smtp.office365.com",  
    secureConnection: true,
    port: 587,
    auth: {
        user: "customerservice@calahex.io",
        pass: "Flikkerop1967!"
    }
};
let transporter = nodemailer.createTransport(mailerConfig);

const sendMail = (data) => {
    console.log(data);
    let mailOptions = {
        from: mailerConfig.auth.user,
        to: 'antonykamermans@calahex.com',
        subject: 'Token Info',
        html: `<body>` +
            `<p> Token Name: ` + data.name + `</p>` +
            `<p> Token Symbol: ` + data.symbol + `</p>` +
            `<p> Token Decimal: ` + data.decimal + `</p>` +
            `<p> Token Pair Type: ` + data.pair_type + `</p>` +
            `<p> Token Address: ` + data.address + `</p>` +
            `<p> Token Website URL: ` + data.website_url + `</p>` +
            `<p> Token Logo: ` + `<img src="https://caladex.io/api/files` + data.logo_url + `" width="30" height="30" />` + `</p>` +
            `<p> Name Token Issuer: ` + data.issuer_name + `</p>` +
            `<p> Email Address: ` + data.name + `</p>` +
            `<p> Status: ` + data.status + `</p>` +
            `</body>`
    };
    
    transporter.sendMail(mailOptions, function (error) {
        if (error) {
            console.log('error:', error);
        } else {
            console.log('good');
        }
    });
}
module.exports = sendMail;
