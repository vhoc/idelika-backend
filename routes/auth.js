const express = require( 'express' )

// Registrar usuario
router.post( '/registro', ( request, response ) => {
    response.send( `Registrar usuario` )
} )

// Acceso de usuario
router.post( '/', ( request, response ) => {
    response.send( `Acceder` )
} )