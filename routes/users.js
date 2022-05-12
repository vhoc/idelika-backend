const express = require( 'express' )
const router = express.Router()

/**
 * Always place static routes first, then dynamic routes last.
 */

router.get( '/', ( request, response ) => {
    response.send( "User List" )
} )

router.get( '/:id', ( request, response ) => {
    response.send( `User is: ${ request.params.id }` )
} )

// Middleware (useful for server side validations)
router.param( 'id', ( request, response, next, id ) => {
    next()
} )

module.exports = router