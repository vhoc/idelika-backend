const express = require( 'express' )
const router = express.Router()
const jwt = require( `jsonwebtoken` )
const { generateAccessToken } = require( `../helpers/generateAccessToken` )

const RefreshToken = require( `../models/refreshToken` )

// Verify Token
router.post( '/token', async ( request, response ) => {
    const authHeader = request.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return response.sendStatus(401)

    jwt.verify( token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if ( error ) return response.sendStatus(403)
        request.user = user
        next()
    } )
} )

// Refresh Token
router.post( '/refreshtoken', async ( request, response ) => {
    const refreshToken = request.body.refreshToken
    if ( refreshToken == null ) return response.sendStatus( 401 )

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
    const refreshToken = request.body.token
    if ( refreshToken == null ) return response.sendStatus( 401 )

    const savedToken = await RefreshToken.findOne( { refreshToken }, 'refreshToken' )
    if ( savedToken == null ) return response.sendStatus( 204 )
    if ( refreshToken !== savedToken.refreshToken ) return response.sendStatus( 403 )

    await RefreshToken.deleteOne( { refreshToken: refreshToken } )
    return response.sendStatus( 204 )
    
} )

// Acceso de usuario
router.post( '/', ( request, response ) => {
    response.send( `Acceder` )
} )

module.exports = router;