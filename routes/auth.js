const express = require( 'express' )
const router = express.Router()
const jwt = require( `jsonwebtoken` )
const { generateAccessToken } = require( `../helpers/generateAccessToken` )
const Usuario = require( `../models/user` )
const Token = require( `../models/token` )
const crypto = require( `crypto` )
const Joi = require( `joi` )
const bcrypt = require( 'bcrypt' )
const { passResetMail } = require( `../helpers/mailer` )

const RefreshToken = require( `../models/refreshToken` )
const { validatePassword } = require( '../validators/usuarios' )

/**
 * TODO:
 * Change responses to JSON responses in reset-password methods.
 */

// Refresh Token
router.post( '/refreshtoken', async ( request, response ) => {
    const refreshToken = request.body.refreshToken
    // No token?
    if ( refreshToken == null ) return response.sendStatus( 401 )

    // Expired or Wrong token?
    const savedToken = await RefreshToken.findOne( { refreshToken }, 'refreshToken' )
    if ( savedToken && refreshToken !== savedToken.refreshToken  ) return response.sendStatus( 403 )

    jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET, ( error, user ) => {
        if ( error ) return response.sendStatus(403)
        const accessToken = generateAccessToken( { nombre: user.nombre } )
        return response.json({ accessToken })
    } )
} )

// Delete Token
router.delete( '/logout', async ( request, response ) => {
    //console.log(request.body)
    const refreshToken = request.body.refreshToken
    if ( refreshToken == null ) return response.sendStatus( 401 )

    const savedToken = await RefreshToken.findOne( { refreshToken }, 'refreshToken' )
    if ( savedToken == null ) return response.sendStatus( 204 )
    if ( refreshToken !== savedToken.refreshToken ) return response.sendStatus( 403 )

    await RefreshToken.deleteOne( { refreshToken: refreshToken } )
    return response.sendStatus( 204 )
    
} )

// Verify Token
router.get( '/', ( request, response ) => {
    const authHeader = request.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return response.sendStatus(401)

    jwt.verify( token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if ( error ) return response.sendStatus(403)
        request.user = user
        return response.sendStatus(200)
    } )
} )

// Password Reset STEP 1 - Send link to user
router.post( '/password-reset', async ( req, res ) => {
    try {
        const schema = Joi.object({ email: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await Usuario.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("user with given email doesn't exist");

        let token = await Token.findOne({ usuarioId: user._id });
        if (!token) {
            token = await new Token({
                usuarioId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.FRONTEND_URL}recover-account/${user._id}/${token.token}?email=${ user.email }`;
        await passResetMail(user.email, user, link);

        res.send("password reset link sent to your email account");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
} )

// Password Reset SETP 2 - Reset user password\
router.post( "/password-reset/:usuarioId/:token", async ( req, res ) => {
    try {
        const schema = Joi.object({ password: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await Usuario.findById(req.params.usuarioId);
        if (!user) return res.status(400).send("invalid link or expired");

        const token = await Token.findOne({
            usuarioId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link or expired");

        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash( req.body.password, salt )

        user.password = hashedPassword;
        await user.save();
        await token.delete();

        res.send("password reset sucessfully.");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
} )

// Password Change
// This function updates the user's password on this backend, not on Ecwid.
router.post( "/password-change/:usuarioId", validatePassword, async ( request, response ) => {
    try {
        const schema = Joi.object({
            // Enable this if you require the current password validation.
            //input: Joi.string().required(),
            password: Joi.string().required(),
            passwordConfirmation: Joi.string().required()
        })
        //console.log(request.body)
        const { error } = schema.validate( request.body )
        if( error ) return response.status(400).json( { status: 400, message: error.details[0].message } )

        const user = await Usuario.findById( request.params.usuarioId )
        if ( !user ) return response.status(404).json( { status: 404, message: "No se encontró el usuario especificado." } )

        /*
        * Enable this if you require the current password validation.
        if ( ! await bcrypt.compare( request.body.input, user.password ) ) {
            return response.status(401).json( { status: 401, message: "Credenciales inválidas" } )
        }*/

        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash( request.body.password, salt )
        user.password = hashedPassword;
        await user.save();

        response.status(200).json( { status: 200, message: "La contraseña ha sido cambiada exitosamente." } )
    } catch ( error ) {
        response.status(500).json( { status: 500, message: error.details[0].message } )
    }
} )

// Account Activation
router.get( `/activate/:usuarioId/:token`, async ( request, response ) => {
    try {
        const user = await Usuario.findById( request.params.usuarioId )
        if ( !user ) {
            console.log( `Invalid activation token received` )
            //return response.redirect( `${ process.env.FRONTEND_URL }activacion?status=invalid` )
            return response.redirect( `${ process.env.FRONTEND_URL }activacion/invalido` )
        }

        const token = await Token.findOne({
            usuarioId: user._id,
            token: request.params.token,
        })
        if ( !token ) {
            console.log( `Invalid activation token received` )
             //return response.redirect( `${ process.env.FRONTEND_URL }activacion?status=invalid` )
             return response.redirect( `${ process.env.FRONTEND_URL }activacion/invalido` )
        }
        console.log( `Valid activation token. Activating user!` )
        // Change active user flag to true
        user.active = true
        user.save()
        token.delete()
        //return response.redirect( `${ process.env.FRONTEND_URL }activacion?status=valid` )
        return response.redirect( `${ process.env.FRONTEND_URL }activacion/valido?name=${user.name}` )
    } catch ( error ) {
        console.log( error )
        return response.send( `Ha ocurrido un error.` )
    }
} )

module.exports = router;