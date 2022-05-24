const express = require( 'express' )
const router = express.Router()
const jwt = require( `jsonwebtoken` )
const { generateAccessToken } = require( `../helpers/generateAccessToken` )

const RefreshToken = require( `../models/refreshToken` )

// Update Token
router.post( '/token', async ( request, response ) => {
    const refreshToken = request.body.token
    if ( refreshToken == null ) return response.sendStatus( 401 )

    const savedToken = await RefreshToken.findOne( { refreshToken }, 'refreshToken' )
    if ( refreshToken !== savedToken.refreshToken || !savedToken.refreshToken ) response.sendStatus( 403 )

    jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET, ( error, user ) => {
        if ( error ) return response.sendStatus(403)
        const accessToken = generateAccessToken( { nombre: user.nombre } )
        response.json({ accessToken })
    } )
} )

router.delete( '/logout', async ( request, response ) => {
    const refreshToken = request.body.token
    if ( refreshToken == null ) return response.sendStatus( 401 )

    const savedToken = await RefreshToken.findOne( { refreshToken }, 'refreshToken' )
    if ( refreshToken !== savedToken.refreshToken || !savedToken.refreshToken ) response.sendStatus( 403 )

    await RefreshToken.deleteOne( { refreshToken: refreshToken } )
    response.sendStatus( 204 )
    
} )

// Acceso de usuario
router.post( '/', ( request, response ) => {
    response.send( `Acceder` )
} )

module.exports = router;