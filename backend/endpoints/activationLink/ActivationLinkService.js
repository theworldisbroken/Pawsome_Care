const nodemailer = require('nodemailer');
const config = require('config')

//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function randomString() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 10) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

async function sendActivationslink(receiver, link) {
    const transporter = await nodemailer.createTransport({
        service: process.env.NODEMAILER_SERVICE || 'gmail',
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        }
    });

    const mailInfos = {
        from: process.env.NODEMAILER_USER,
        to: receiver,
        subject: 'Activation Link!',
        html: `
        <head>
            <style>
                p { font-weight: bold; text-align: center; color: #83614e;}
                a { color: #83614e; text-decoration: none; }
                .link { border: 2px solid #83614e; border-radius: 8px; padding: 10px; text-align: center; margin-top: 20px; }
                h2 {text-align: center; color: #83614e;}
            </style>
        </head>
        <body>
            <h2>Pawsome Care</h2>
            <p>Klicken Sie auf diesen Link für die Aktivierung:</p>
            <div class="link" >
                <p><a href="${link}">${link}</a></p>
            </div>
        </body>
    `
    };

    await transporter.sendMail(mailInfos, function (error, info) {
        if (error) {
            // console.log(error);
        } else {
            // console.log('Email sent: ' + info.response);
        }
    });
}


module.exports = {
    randomString,
    sendActivationslink
}