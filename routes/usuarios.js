const express = require( 'express' )
//const res = require('express/lib/response')
const router = express.Router()
const Usuario = require( `../models/usuario` )
const bcrypt = require( 'bcrypt' )
const mongoose = require('mongoose')
const { validateCreate } = require( '../validators/usuarios' )

mongoose.connect( process.env.DATABASE_URL, () => {
    console.log( "Connected to database" )
}, error => {
    console.error( error )
} )
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
        console.log(salt)
        console.log(hashedPassword)
        const user = new Usuario({
            nombre: request.body.nombre,
            email: request.body.email,
            password: hashedPassword,
            empresa: request.body.empresa,
            active: true,
        })

        await user.save()
        response.status(201).send()
    } catch {
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
        console.log(usuario)
        if( usuario == null ) return response.status(400).send('No se encontró el usuario')

    try {
        ! await bcrypt.compare( request.body.password, usuario.password ) ?
            response.status(403).json( { status: 403, message: "Invalid credentials" } ) :
        response.status(200).json( { status: 200, message: "Logged in" } )
    } catch (error) {
        response.status(500).json( { status: 500, message: error } )
    }
} )


// Middleware (useful for server side validations)
router.param( 'id', ( request, response, next, id ) => {
    next()
} )

module.exports = router