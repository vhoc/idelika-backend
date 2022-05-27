const express = require( 'express' )
const router = express.Router()
const Preferencias = require( `../models/preferencia` )
const Usuario = require( `../models/usuario` )

/**
 * TOOD:
 * Protect these routes with JWT
 */

// Get ONE
router.get( `/:usuarioId`, async (request, response) => {

    try {
        const preferencia = await Preferencias.findOne( { usuarioId: request.params.usuarioId } )
        if ( preferencia == null ) return response.status(404).json( { status: 404, message: "No se encontró la configuración del usuario." } )
        return response.status(200).json( preferencia )
    } catch ( error ) {
        return response.status(500).json( { status: 500, message: error.message } )
    }

})

// Upsert ONE
router.post( `/`, async (request, response) => {

    try {
        // VALIDATE USER FIRST!!!
        //const usuario = await Usuario.findOne( { _id: request.body.usuarioId } )
        //if ( ! usuario ) return response.status(404).json( { status: 404, message: "No se encontró el usuario de cuya configuración se intentó obtener." } )
        
        await Preferencias.findOneAndUpdate( { usuarioId: request.body.usuarioId }, request.body, { upsert: true } )

        const preferencias = await Preferencias.findOne( { usuarioId: request.body.usuarioId } )
        return response.status(200).json( { status: 200, message: "La configuración ha sido guardada.", preferencias } )
    } catch ( error ) {
        return response.status(500).json( { status: 500, message: error.message } )
    }

})

module.exports = router;