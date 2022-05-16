const express = require( 'express' )
//const res = require('express/lib/response')
const router = express.Router()
const Usuario = require( `../models/usuario` )
const bcrypt = require( 'bcrypt' )

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

// Create one
router.post( '/', ( request, response ) => {
    response.send( `Create one user` )
} )

// Update one
router.patch( '/:id', ( request, response ) => {
    response.send( `Update one user: ${ request.params.id }` )
} )

// Delete one 
router.delete( '/:id', ( request, response ) => {
    response.send( `Delete one user: ${ request.params.id }` )
} )




// Middleware (useful for server side validations)
router.param( 'id', ( request, response, next, id ) => {
    next()
} )

// Tests
router.post( '/test/', ( request, response ) => {
    bcrypt.hash( request.body.password, 11).then( hashedPass => {
        Usuario.create({
            nombre: request.body.nombre,
            apellidoPaterno: request.body.apellidoPaterno,
            apellidoMaterno: request.body.apellidoMaterno,
            email: request.body.email,
            password: hashedPass,
            empresa: request.body.empresa,
            avatar: request.body.avatar,
        }).then( newUser => {
            response.status( 201 ).json( newUser )
        } ).catch( error => {
            response.status( 500 ).json( {message: error.message} )
            console.error( error )
        } )
    } ).catch( error => {
        response.status( 500 ).json( {message: error.message} )
        console.error( error )
    } )

    
} )

module.exports = router