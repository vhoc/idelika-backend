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
        text: `Visita este enlace para activar tu cuenta: ${ activationLink }`,
        html: htmlToSend,
    }

    transporter.sendMail(mailOptions, ( error, info ) => {
        console.log( `Sending activation e-mail to ${ address }` )
        error ? console.log(error) : console.log( `Activation e-mail sent. ${ info.response }` )
    })

}

const passResetMail = async ( address, usuario, link ) => {

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    })

    const emailTemplateSource = fs.readFileSync(path.join(__dirname, "./../views/resetpass.handlebars"), "utf8")

    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
        userName: usuario.nombre,
        activationLink: link,
    })

    const mailOptions = {
        from: 'no-responder@suempresa.us',
        to: address,
        subject: "Restablece tu Contrase??a de Session Scheduler",
        text: `Visita este enlace para restablecer tu contrase??a: ${ link }.`,
        html: htmlToSend,
    }

    transporter.sendMail(mailOptions, ( error, info ) => {
        console.log( `Sending password reset e-mail to ${ address }` )
        error ? console.log(error) : console.log( `Password reset e-mail sent. ${ info.response }` )
    })

}

module.exports = { registrationMail, passResetMail }