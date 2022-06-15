const express = require( 'express' )
const router = express.Router()
const axios = require( `axios` )

router.post( `/auth/login`, async ( request, response ) => {
    try {
        console.log( request.body.authCode )
        return
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

module.exports = router;