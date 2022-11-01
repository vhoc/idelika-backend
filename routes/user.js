require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()
const axios = require('axios')
const Usuario = require( `../models/user` )
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

        const user = new Usuario({
            name: request.body.name,
            type: request.body.type,
            email: request.body.email,
            password: hashedPassword,
            phone: request.body.phone,
            //empresa: license.empresa,
            //licenseKey: license.key,
            //buttonLink: 'tmp',
            active: false,
        })
        //await user.save()

        // If email exists on Ecwid API:
        const users = await axios.get( `${process.env.ECWID_API_URL}/customers`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: process.env.IDELIKA_ACCESS_TOKEN
            }
        } )

        console.log(`Users from ecwid: ${users.response}`)
            // Check if user exists in the database.
                // Do nothing and return user exists error.

            // If user doesnt exist in database.
                // Create user in database with its tier (customer group) from Ecwid API

        // If email doesnt exist on Ecwid API:
            // Create customer on Ecwid, with tier (customer group) 0
            // Create user on local database

        //user.buttonLink = `${process.env.FRONTEND_URL}solicitud/?uid=${user._id}`
        //user.save()
        
        registrationMail( request.body.email, user )
        
        console.log( `New user ${ request.body.email } registered.` )
        return response.status(201).json( {
            status: 201,
            message: "Gracias por registrarte. En breve recibirás un correo electrónico con un enlace de activación que deberás visitar para comenzar a usar tu cuenta.",
            user: {
                email: user.email,
                name: user.name,
                phone: user.phone,
                type: user.type,
                tier: user.tier,
            }
        } )
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
        if( usuario == null ) return response.status(404).json( { status: 404, message: "No se encontró el usuario" } )
        if( usuario.active === false ) return response.status(403).json( { status: 403, message: "Es necesario activar su cuenta desde el correo de activación que le enviamos." } )
        
    try {
        if ( ! await bcrypt.compare( request.body.password, usuario.password ) ) {            
            console.log( `Authentication FAILED for user ${ usuario.email } from ${ request.ip  }` )
            return response.status(401).json( { status: 401, message: "Credenciales inválidas" } )
        }
        // Generate token
        const usuarioObject = { email: usuario.email }
        const accessToken = generateAccessToken( usuarioObject )
        const refreshToken = jwt.sign( usuarioObject, process.env.REFRESH_TOKEN_SECRET )
        RefreshToken.create( { refreshToken } )
        console.log( `Authentication SUCCESSFUL for user ${ usuario.email } from ${ request.ip  }` )
        return response.status(200).json( { status: 200, message: "Autenticación exitosa.", userId: usuario._id, email: usuario.email, name: usuario.name, buttonLink: usuario.buttonLink, activo: usuario.active, tier: usuario.tier, accessToken, refreshToken } )
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