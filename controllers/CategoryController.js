const express = require( 'express' )
const router = express.Router()
const Category = require( `../models/category` )

/**
 * Get All
 */
router.get( `/`, async (request, response) => {
    try {
        const categories = await Category.find( {} )
        if ( categories == null ) return response.status(404).json( { status: 404, message: "No se encontraron categorías." } )
        return response.status(200).json( categories )
    } catch ( error ) {
        return response.status(500).json( { status: 500, message: error.message } )
    }
} )

module.exports = router;