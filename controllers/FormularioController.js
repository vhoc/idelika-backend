const express = require( 'express' )
const router = express.Router()
const Formulario = require( `../models/formulario` )
const multer = require( `multer` )
const path = require( `path` )
const fs = require( `fs` )

const storagePath = `/var/www/zss-frontend/upload`

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storagePath)
    },
    filename: (req, file, cb) => {
        //console.dir( req, null, { depth: null } )
        //console.log( `req.usuarioId: ${ req.body.usuarioId }` )
        //console.log(file)
        cb(null, req.body.usuarioId + '_' + Date.now() + path.extname( file.originalname ) )
    }
})

const upload = multer({ storage: storage })

/**
 * TODO:
 * Protect these routes with JWT
 */

// Get ONE
router.get( `/:usuarioId`, async (request, response) => {

    try {
        const formulario = await Formulario.findOne( { usuarioId: request.params.usuarioId } )
        if ( formulario == null ) return response.status(404).json( { status: 404, message: "No se encontró el formulario del usuario." } )
        return response.status(200).json( formulario )
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
        
        await Formulario.findOneAndUpdate( { usuarioId: request.body.usuarioId }, request.body, { upsert: true } )

        const formulario = await Formulario.findOne( { usuarioId: request.body.usuarioId } )
        return response.status(200).json( { status: 200, message: "El formulario ha sido guardado.", formulario } )
    } catch ( error ) {
        return response.status(500).json( { status: 500, message: error.message } )
    }

})

// Upload Logo Image
router.post( `/logo`, upload.single(`file`), async (request, response) => {
    try {
        const previousFileFullPath = request.body.currentFile
        const previousFileName = previousFileFullPath.substring( previousFileFullPath.lastIndexOf( '/' ) + 1 )
        fs.unlink( `${ storagePath }/${ previousFileName }`, error => {
            console.log( error )
        } )
        const formulario = await Formulario.findOne( { usuarioId: request.body.usuarioId } )
        formulario.logotipo = `${ process.env.FRONTEND_URL }uploads/${ request.file.filename }`
        formulario.save()
        return response.status(200).json( { status: 200, message: 'Image uploaded.', imageUrl: formulario.logotipo } )
    } catch ( error ) {
        return response.status(500).json( { status: 500, message: error.message } )
    }
} )


module.exports = router;