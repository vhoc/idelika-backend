const express = require( 'express' )
const router = express.Router()
const LicenseKey = require( `../models/licenseKey` )

// Insert ONE
/*
router.post( `/:cantidad`, async (request, response) => {

    try {
        for ( let i = 0; i < request.params.cantidad; i++ ) {
            const license = new LicenseKey({})
            await license.save()
        }        

        return response.status(200).json( { status: 200, message: "Las claves de licencia han sido creadas" } )
    } catch ( error ) {
        return response.status(500).json( { status: 500, message: error.message } )
    }

})*/

module.exports = router;