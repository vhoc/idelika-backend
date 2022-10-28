const { check } = require( 'express-validator' )
const { validateResult } = require( '../helpers/validateHelper' )
const Usuario = require( `../models/user` )
const LicenseKey = require( `../models/licenseKey` )

const validateCreate = [

    check( 'name' )
        .exists({ checkFalsy: true }).withMessage( `El nombre no puede estar vacío.` )
        .not().isEmpty().withMessage( `El nombre no puede estar en blanco.` )
        .isLength( { min: 5, max: 100 } ).withMessage( `El nombre debe tener entre 5 y 100 caracteres.` )
        .matches(/^([a-záéíóú'´üñ]|\s){3,50}$/i).withMessage( `El nombre no admite caracteres inválidos, solo letras y espacios.` ),

    check( 'email' )
        .exists({ checkFalsy: true }).withMessage( `El correo no puede estar vacío.` )
        .not().isEmpty()
        .isEmail().withMessage( `El correo debe tener el formado correcto.` )
        .custom( value => {
            return Usuario.findOne( { email: value } ).then( usuario => {
                if ( usuario ) {
                    return Promise.reject( 'El usuario ya fue registrado anteriormente.' )
                }
            } )
        } ),
    
    check( 'password' )
        .exists({ checkFalsy: true }).withMessage( `Se requiere definir una contraseña.` )
        .not().isEmpty().withMessage( `La contraseña no puede estar en blanco.` )
        .isLength( { min: 6, max: 100 } ).withMessage( `La contraseña debe tener entre 6 y 100 caracteres.` ),

    check( 'passwordConfirmation' )
        .exists({ checkFalsy: true }).withMessage( `Se requiere confirmar la contraseña.` )
        .not().isEmpty().withMessage( `La confirmación de la contraseña no coincide con la contraseña.` )
        .isLength( { min: 6, max: 100 } ).withMessage( `La confirmación de la contraseña debe tener entre 6 y 100 caracteres.` )
        .custom( (value, {req}) => {
            //console.dir(req)
            if ( value !== req.body.password ) {
                throw new Error( 'La confirmación de la contraseña no coincide con la contraseña.' )
            }
            return true
    } ),// AGREGAR VALIDAR EMPRESA EXISTENTE
        
    ( request, response, next ) => {
        validateResult( request, response, next )
    }

]

const validatePassword = [
    check( 'password' )
        .exists({ checkFalsy: true }).withMessage( `Se requiere definir una contraseña.` )
        .not().isEmpty().withMessage( `La contraseña no puede estar en blanco.` )
        .isLength( { min: 6, max: 100 } ).withMessage( `La contraseña debe tener entre 6 y 100 caracteres.` ),

    check( 'passwordConfirmation' )
        .exists({ checkFalsy: true }).withMessage( `Se requiere confirmar la contraseña.` )
        .not().isEmpty().withMessage( `La confirmación de la contraseña no coincide con la contraseña.` )
        .isLength( { min: 6, max: 100 } ).withMessage( `La confirmación de la contraseña debe tener entre 6 y 100 caracteres.` )
        .custom( (value, {req}) => {
            //console.dir(req)
            if ( value !== req.body.password ) {
                throw new Error( 'La confirmación de la contraseña no coincide con la contraseña.' )
            }
            return true
        } ),
    ( request, response, next ) => {
        validateResult( request, response, next )
    }
]

const validateLicenseKey = [
    check( 'licenseKey' )
        .exists({ checkFalsy: true }).withMessage( `No se ha especificado una clave de licencia.` )
        // Checar validez (si existe o es encontrada en la base de datos)
        .custom( value => {
            return LicenseKey.findOne( { key: value } ).then( license => {
                if ( !license ) {
                    return Promise.reject( 'La clave de licencia ingresada es inválida.' )
                }
                return true
            } )        
        } )
        // Checar usuarios disponibles   
        .custom( value => {
            return LicenseKey.findOne( { key: value } ).then( license => {
                if ( license.usersAvailable <= 0 ) {
                    return Promise.reject( 'Ésta clave de licencia ya no tiene más usuarios disponibles. Póngase en contacto con el administrador de la licencia de su empresa.' )
                }
                return true
            } )
        } ),
        ( request, response, next ) => {
            validateResult( request, response, next )
        }

]

module.exports = { validateCreate, validatePassword, validateLicenseKey }