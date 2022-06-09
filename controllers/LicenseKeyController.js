const express = require( 'express' )
const router = express.Router()
const LicenseKey = require( `../models/licenseKey` )

// Insert ONE

router.post( `/`, async (request, response) => {

    try {    
        const license = new LicenseKey({
            empresa: request.body.empresa,
            usersAvailable: request.body.usersAvailable,
        })
        await license.save()

        return response.status(200).json( { status: 200, message: "La clave de licencia ha sido creada" } )
    } catch ( error ) {
        return response.status(500).json( { status: 500, message: error.message } )
    }

})

module.exports = router;