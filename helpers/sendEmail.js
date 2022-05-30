const nodemailer = require( `nodemailer` )

module.exports = async ( email, subject, text ) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        })

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        })

        console.log( `Email sent successfully` )
    } catch ( error ) {
        console.log( error, `Error sending email` )
    }
}