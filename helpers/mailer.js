const nodemailer = require( `nodemailer` )
const handlebars = require( `handlebars` )
const path = require("path")
const fs = require("fs")
const { generateActivationLink } = require( `../helpers/generateActivationLink` )

const registrationMail = async ( address, usuario ) => {

    const activationLink = await generateActivationLink( usuario )

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    })

    const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./../views/activaruser.handlebars"), "utf8")

    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
        userName: usuario.nombre,
        activationLink: activationLink,
    })

    const mailOptions = {
        from: 'no-responder@suempresa.us',
        to: address,
        subject: "Activa tu cuenta en Session Scheduler",
        text: "Versión de texto del mensaje.",
        html: htmlToSend,
    }

    transporter.sendMail(mailOptions, ( error, info ) => {
        console.log( `Sengind activation e-mail to ${ address }` )
        error ? console.log(error) : console.log( `Activation e-mail sent. ${ info.response }` )
    })

}

module.exports = { registrationMail }