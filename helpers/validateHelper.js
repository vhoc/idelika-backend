const { validationResult } = require( 'express-validator' )

const validateResult = ( request, response, next ) => {
    try {
        validationResult( request ).throw()
        return next()
    } catch ( error ) {
        response.status(422)
        response.send( { errors: error.array() } )
    }
}

module.exports = { validateResult }