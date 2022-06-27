const express = require( 'express' )
const router = express.Router()
const User = require( '../models/usuario' )
const axios = require( 'axios' )
const url = require('url');

router.post( `/auth/login`, async ( request, response ) => {

    const base64keys = Buffer.from( `${ process.env.ZOOM_CLIENT_ID }:${ process.env.ZOOM_CLIENT_SECRET }` ).toString( 'base64' )
    const params = new url.URLSearchParams({
        code: request.body.authCode,
        grant_type: 'authorization_code',
        redirect_uri: 'https://6c99-187-137-41-184.ngrok.io/zoomcallback',
    })

    try {
        //console.log( `El usuario ${ usuario.email } ha activado la integración con Zoom con el Access Token: ${ usuario.accessTokenZoom }` )

        try {
            const zoomAuth = await axios.post( `https://zoom.us/oauth/token`, params.toString(), {
                headers: {
                    'Authorization': `Basic ${ base64keys }`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            } )
            console.log( zoomAuth )
            await User.findOneAndUpdate( { _id: request.body.usuarioId }, { refreshTokenZoom: zoomAuth.data.refresh_token } )
            await User.findOneAndUpdate( { _id: request.body.usuarioId }, { zoom: true } )
        } catch (error) {
            console.log( `zoomAuth ERROR: ${ error }` )
            console.dir( error )
        }
        

        return response.status(200).json( { status: 200, message: `Acceso a Zoom autorizado.` } )
        //return response.json( request.body.authCode )
    } catch ( error ) {
        return response.send( error )
    }
} )

router.post( `/auth/refreshtoken`, async ( request, response ) => {

} )

router.post( `/meeting`, async ( request, response ) => {
    try {
        return response.status(201).json( newMeeting )
    } catch ( error ) {
        return response.status(500).json( error )
    }
    
} )

router.get( `/callback`, async ( request, response ) => {
    return response.json()
} )

module.exports = router;