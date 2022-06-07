const express = require( 'express' )
//const res = require('express/lib/response')
const router = express.Router()
const Usuario = require( `../models/usuario` )
const Preferencias = require( `../models/preferencia` )
const Formularios = require( `../models/formulario` )
const bcrypt = require( 'bcrypt' )
//const mongoose = require('mongoose')
const { validateCreate } = require( '../validators/usuarios' )
const { generateAccessToken } = require( '../helpers/generateAccessToken' )
const RefreshToken = require( `../models/refreshToken` )
const jwt = require( `jsonwebtoken` )
/*
mongoose.connect( process.env.DATABASE_URL, () => {
    console.log( "Connected to database" )
}, error => {
    console.error( error )
} )*/
/** 
 * Always place static routes first, then dynamic routes last.
 */

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
router.get( '/:id', ( request, response ) => {
    response.send( `Get one user: ${ request.params.id }` )
} )
/***
 * cuando se genere una cuenta
 * llaves del api, jalar a los usuarios
 * y comparar con el usuario
 * los usuarios estaran en una base de datos
 * crear un servicio en background que este actualizando la lista de usuarios en la db.
 */
// Create one
router.post( '/', validateCreate, async ( request, response ) => {
        //if( !errors.isEmpty() ) return response.status(400).json( { errors: errors.array() } )
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash( request.body.password, salt )
        //console.log(salt)
        //console.log(hashedPassword)
        const user = new Usuario({
            nombre: request.body.nombre,
            email: request.body.email,
            password: hashedPassword,
            empresa: request.body.empresa,
            buttonLink: request.body.buttonLink,
            active: true,
        })
        await user.save()

        // Create default preferences
        const preference = new Preferencias({
            usuarioId: user._id,
        })
        await preference.save()

        // Create default form
        const form = new Formularios({
            usuarioId: user._id,
        })
        await form.save()
        
        console.log( `New user ${ request.body.email } registered.` )
        response.status(201).send()
    } catch ( error ) {
        console.error( error )
        response.status(500).send()
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
        return response.status(200).json( { status: 200, message: "Autenticación exitosa.", userId: usuario._id, email: usuario.email, nombre: usuario.nombre, empresa: usuario.empresa, activo: usuario.active, accessToken, refreshToken } )
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