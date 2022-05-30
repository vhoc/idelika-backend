const express = require( 'express' )
const router = express.Router()
const jwt = require( `jsonwebtoken` )
const { generateAccessToken } = require( `../helpers/generateAccessToken` )

const RefreshToken = require( `../models/refreshToken` )

// Refresh Token
router.post( '/refreshtoken', async ( request, response ) => {
    const refreshToken = request.body.refreshToken
    // No token?
    if ( refreshToken == null ) return response.sendStatus( 401 )

    // Expired or Wrong token?
    const savedToken = await RefreshToken.findOne( { refreshToken }, 'refreshToken' )
    if ( savedToken && refreshToken !== savedToken.refreshToken  ) return response.sendStatus( 403 )

    jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET, ( error, user ) => {
        if ( error ) return response.sendStatus(403)
        const accessToken = generateAccessToken( { nombre: user.nombre } )
        return response.json({ accessToken })
    } )
} )

// Delete Token
router.delete( '/logout', async ( request, response ) => {
    //console.log(request.body)
    const refreshToken = request.body.refreshToken
    if ( refreshToken == null ) return response.sendStatus( 401 )

    const savedToken = await RefreshToken.findOne( { refreshToken }, 'refreshToken' )
    if ( savedToken == null ) return response.sendStatus( 204 )
    if ( refreshToken !== savedToken.refreshToken ) return response.sendStatus( 403 )

    await RefreshToken.deleteOne( { refreshToken: refreshToken } )
    return response.sendStatus( 204 )
    
} )

// Verify Token
router.get( '/', ( request, response ) => {
    const authHeader = request.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return response.sendStatus(401)

    jwt.verify( token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if ( error ) return response.sendStatus(403)
        request.user = user
        return response.sendStatus(200)
    } )
} )

// Password Reset STEP 1 - Send link to user
router.post( '/password-reset', ( request, response ) => {

} )

// Password Reset SETP 2 - Reset user password\
router.post( 'password-reset/:usuarioId/:token', ( request, response ) => {

} )

module.exports = router;