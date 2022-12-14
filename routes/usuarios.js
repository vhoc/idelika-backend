const express = require( 'express' )
const router = express.Router()
const Usuario = require( `../models/usuario` )
//const LicenseKey = require( `../models/licenseKey` )
//const Preferencias = require( `../models/preferencia` )
//const Formularios = require( `../models/formulario` )
const bcrypt = require( 'bcrypt' )
const { validateCreate, validatePassword } = require( '../validators/usuarios' )
const { generateAccessToken } = require( '../helpers/generateAccessToken' )
const RefreshToken = require( `../models/refreshToken` )
const jwt = require( `jsonwebtoken` )
const { registrationMail } = require( `../helpers/mailer` )

// Get all
router.get( '/', async ( request, response ) => {
    // response.send( "Get all users" )
    try {
        const usuarios = await Usuario.find()
        response.json( usuarios )
    } catch (error) {
        response.status( 500 ).json( {message: error.message} )
        console.error( error )
    }
} )

// Get one
router.get( '/:id', async ( request, response ) => {
    //response.send( `Get one user: ${ request.params.id }` )
    try {
        const usuario = await Usuario.findById( request.params.id )
        //const formulario = await Formularios.findOne( { usuarioId: request.params.id } )
        //const preferencias = await Preferencias.findOne( { usuarioId: request.params.id } )

        return response.status( 200 ).json( {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            //empresa: usuario.empresa,
            //formulario,
            //preferencias
        } )
    } catch ( error ) {
        return response.status( 500 ).json( { status: 500, message: error.message } )
    }
} )

// REGISTRATION
router.post( '/', [validateCreate, validatePassword], async ( request, response ) => {
    
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash( request.body.password, salt )

        // Substract one available user from the license
        //const license = await LicenseKey.findOne( { key: request.body.licenseKey } )
        //license.usersAvailable = license.usersAvailable - 1,
        //await license.save()

        const user = new Usuario({
            name: request.body.name,
            lastName: request.body.lastName,
            type: request.body.type,
            email: request.body.email,
            password: hashedPassword,
            //empresa: license.empresa,
            //licenseKey: license.key,
            //buttonLink: 'tmp',
            active: false,
        })
        await user.save()

        //user.buttonLink = `${process.env.FRONTEND_URL}solicitud/?uid=${user._id}`
        user.save()

        // Create default preferences
        
        //const preference = new Preferencias({
        //    usuarioId: user._id,
        //})
        //await preference.save()

        // Create default form
        //const form = new Formularios({
        //    usuarioId: user._id,
        //})
        //await form.save()
        
        registrationMail( request.body.email, user )
        // Account Activation route is located on ./auth.js It's the last one in the file.
        
        console.log( `New user ${ request.body.email } registered.` )
        return response.status(201).json( { status: 201, message: "Gracias por registrarte. En breve recibir??s un correo electr??nico con un enlace de activaci??n que deber??s visitar para comenzar a usar tu cuenta." } )
    } catch ( error ) {
        console.error( error )
        return response.status(500).json( { status: 500, message: "Ha ocurrido un error al intentar el registro." } )
    }
} )

// Update one
router.patch( '/:id', ( request, response ) => {
    response.send( `Update one user: ${ request.params.id }` )
} )

// Delete one 
router.delete( '/:id', ( request, response ) => {
    response.send( `Delete one user: ${ request.params.id }` )
} )

// Login
router.post( '/login', async ( request, response ) => {
        const usuario = await Usuario.findOne( { email: request.body.email } )
        if( usuario == null ) return response.status(404).json( { status: 404, message: "No se encontr?? el usuario" } )
        if( usuario.active === false ) return response.status(403).json( { status: 403, message: "Es necesario activar su cuenta desde el correo de activaci??n que le enviamos." } )
        
    try {
        if ( ! await bcrypt.compare( request.body.password, usuario.password ) ) {            
            console.log( `Authentication FAILED for user ${ usuario.email } from ${ request.ip  }` )
            return response.status(401).json( { status: 401, message: "Credenciales inv??lidas" } )
        }
        // Generate token
        const usuarioObject = { email: usuario.email }
        const accessToken = generateAccessToken( usuarioObject )
        const refreshToken = jwt.sign( usuarioObject, process.env.REFRESH_TOKEN_SECRET )
        RefreshToken.create( { refreshToken } )
        console.log( `Authentication SUCCESSFUL for user ${ usuario.email } from ${ request.ip  }` )
        return response.status(200).json( { status: 200, message: "Autenticaci??n exitosa.", userId: usuario._id, email: usuario.email, nombre: usuario.nombre, empresa: usuario.empresa, buttonLink: usuario.buttonLink, activo: usuario.active, accessToken, refreshToken } )
        // refreshToken route is located in ./auth.js
    } catch (error) {
        console.error( error )
        return response.status(500).json( { status: 500, message: error } )
    }
} )


// Middleware (useful for server side validations)
router.param( 'id', ( request, response, next, id ) => {
    next()
} )

module.exports = router