require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()
const axios = require('axios')
const Usuario = require( `../models/user` )
//const LicenseKey = require( `../models/licenseKey` )
//const Preferencias = require( `../models/preferencia` )
//const Formularios = require( `../models/formulario` )
const bcrypt = require( 'bcrypt' )
const { validateCreate, validatePassword } = require( '../validators/usuarios' )
const { generateAccessToken } = require( '../helpers/generateAccessToken' )
const RefreshToken = require( `../models/refreshToken` )
const jwt = require( `jsonwebtoken` )
const { registrationMail } = require( `../helpers/mailer` )
//tests
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const SocialLoginToken = require('../models/socialLoginToken');
const appleSignin = require('apple-signin-auth');

// Get all
router.get( '/', async ( request, response ) => {
    // response.send( "Get all users" )
    try {
        const usuarios = await Usuario.find()
        response.json( usuarios )
    } catch (error) {
        response.status( 500 ).json( {message: error.message} )
        console.error( error )
    }
} )

// Get one
router.get( '/:id', async ( request, response ) => {
    //response.send( `Get one user: ${ request.params.id }` )
    try {
        const usuario = await Usuario.findById( request.params.id )

        return response.status( 200 ).json( {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
        } )
    } catch ( error ) {
        return response.status( 500 ).json( { status: 500, message: error.message } )
    }
} )

// REGISTRATION
router.post( '/', [validateCreate, validatePassword], async ( request, response ) => {

    try {

        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash( request.body.password, salt )
        //console.log(ecwidUser.data.items)❯ cd frontend


        // Verify user's existence on Ecwid API by their email
        const ecwidUser = await axios.get( `${process.env.ECWID_API_URL}/customers`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: process.env.IDELIKA_ACCESS_TOKEN
            },
            params: { email: request.body.email }
        } )
        
        // If the user's email exists on Ecwid, get user's data
        // and add it to the new user on the local database.
        if (ecwidUser.data.items.length > 0) {

            const user = new Usuario({
                ecwidUserId: ecwidUser.data.items[0].id,
                name: request.body.name,
                type: request.body.type,
                email: request.body.email,
                password: hashedPassword,
                phone: request.body.phone,
                active: false,
            })
            user.save()
            registrationMail( request.body.email, user )
            console.log( `New user ${ request.body.email } registered.` )
            return response.status(201).json( {
                status: 201,
                message: "Gracias por registrarte. En breve recibirás un correo electrónico con un enlace de activación que deberás visitar para comenzar a usar tu cuenta.",
                user: {
                    ecwidUserId: user.ecwidUserId,
                    email: user.email,
                    type: user.type,
                    name: user.name,
                    phone: user.phone,
                    active: user.active,
                }
            } )

        } else {
            // If email doesnt exist on Ecwid API:
            // Create customer on Ecwid, with tier (customer group) 0
            // Create user on local database
            axios.post( `${process.env.ECWID_API_URL}/customers`, {
                email: request.body.email,
                password: request.body.password,
                customerGroupId: 0,
                billingPerson: {
                    name: request.body.name,
                }
            }, {
                headers: {
                    "method": 'POST',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: process.env.IDELIKA_ACCESS_TOKEN
                },
            } ).then((ecwidResponse) => {
                //console.log(`Created on ecwid: ${ecwidResponse.data.id}`)
                const user = new Usuario({
                    ecwidUserId: ecwidResponse.data.id,
                    name: request.body.name,
                    type: request.body.type,
                    email: request.body.email,
                    password: hashedPassword,
                    phone: request.body.phone,
                    active: false,
                })
                user.save()
                registrationMail( request.body.email, user )
                console.log( `New user ${ request.body.email } registered.` )
                return response.status(201).json( {
                    status: 201,
                    message: "Gracias por registrarte. En breve recibirás un correo electrónico con un enlace de activación que deberás visitar para comenzar a usar tu cuenta.",
                    user: {
                        ecwidUserId: user.ecwidUserId,
                        email: user.email,
                        type: user.type,
                        name: user.name,
                        phone: user.phone,
                        active: user.active,
                    }
                } )
            }).catch(error => {
                console.error(error)
                return response.status(422).json({
                    status: 422,
                    message: "Hubo un error al crear el usuario en el sistema de la tienda.",
                })
            })
        }

        

        //user.buttonLink = `${process.env.FRONTEND_URL}solicitud/?uid=${user._id}`
        //user.save()
        
        //registrationMail( request.body.email, user )
        
        
    } catch ( error ) {
        console.error( error )
        return response.status(500).json( { status: 500, message: "Ha ocurrido un error al intentar el registro." } )
    }
} )

// Delete the user
router.delete( '/:id', async (request, response) => {

    try {
        const usuario = await Usuario.findOne( { _id: request.params.id } )

        // Check user
        if( usuario == null ) return response.status(404).json( { status: 404, message: "No se encontró el usuario" } )

        // Check authorization header existence
        if( !request.headers.authorization ) response.status(403).json( { status: 403, message: "Acceso no autorizado (#1)" } )

        const refreshToken = request.headers.authorization.split(' ')[1]
        console.log(`Received token: ${refreshToken}`)

        // Check password existence
        /*
        if( !request.headers.password ) response.status(403).json( {status: 403, message: "Acceso no autorizado (#2)" } )

        // Check password validity
        if ( ! await bcrypt.compare( request.headers.password, usuario.password ) ) {            
            console.log( `Authentication FAILED for deleting user ${ usuario.email } from ${ request.ip  }` )
            return response.status(401).json( { status: 401, message: "La contraseña es incorrecta." } )
        }
        */

        // Check token validity
        if ( refreshToken == null ) return response.status(401).json( {status: 401, message: "Acceso no autorizado (#4)" } )

        const savedToken = await RefreshToken.findOne( { refreshToken }, 'refreshToken' )
        if ( savedToken == null ) return response.sendStatus( 204 )
        if ( refreshToken !== savedToken.refreshToken ) return response.status(403).json( {status: 403, message: "Acceso no autorizado (#5)" } )

        // Delete user (customer) from Ecwid
        // Verify user's existence on Ecwid API by their email
        const ecwidUser = await axios.get( `${process.env.ECWID_API_URL}/customers`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: process.env.IDELIKA_ACCESS_TOKEN
            },
            params: { email: request.body.email }
        } )

        if (ecwidUser.data.items.length > 0) {
            // If there is a user, delete the user.
            axios.delete(`${process.env.ECWID_API_URL}/customers/${usuario.ecwidUserId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: process.env.IDELIKA_ACCESS_TOKEN
                }
            }).then((response) => {
                console.log(response, `Usuario eliminado de Ecwid.`)
            }).catch((error) => {
                console.log(error, 'Hubo un error al intentar eliminar el usuario de ecwid.')
            })
        } else {
            // If no user is found in Ecwid, just log it.
            console.log(`No user found in Ecwid with ID ${usuario.ecwidUserId}.`)
        }

        //revoke google access tesst
        const socialLogin = await SocialLoginToken.findOne({userId: usuario.ecwidUserId});
        if (socialLogin.googleLoginToken !==null) {
            // const ticket = await client.verifyIdToken({
            //     idToken: socialLogin.googleLoginToken,
            //     audience: process.env.GOOGLE_CLIENT_ID
            // })
            // const {email} = ticket.getPayload();
            // if (email===usuario.email) {
            // }
            client.revokeToken(socialLogin.googleLoginToken);
        }
        if (socialLogin.appleLoginToken!=null) {
            const options ={
                clientID: process.env.APPLE_CLIENT_ID,
                clientSecret: process.env.APPLE_AUTH_KEY, // clientSECRET_APPLE is not in the .env file
                tokenTypeHint: 'access_token'
            }
            try {
                await appleSignin.revokeAuthorizationToken(socialLogin.appleLoginToken, options);
            } catch (err) {
                console.error(err);
            }
        }
        
        await socialLogin.deleteOne({userId: usuario.ecwidUserId});
        //end test
        await RefreshToken.deleteOne( { refreshToken: refreshToken } )
        await usuario.deleteOne( { _id: request.params.id } )
        return response.status(204).json( {status: 204, message: "Tu usuario ha sido eliminado. Esperamos volver a verte pronto." } )
    } catch (error) {
        console.log(error, `Hubo un error en el proceso de eliminación del usuario ID: ${request.params.id}.`)
        return response.status(500).json( { status: 500, error } )
    }    

} )

// Update one user
router.patch( '/:id', async ( request, response ) => {
    const usuario = await Usuario.findOne( { _id: request.params.id } )
    if( usuario == null ) return response.status(404).json( { status: 404, message: "No se encontró el usuario" } )

    try {
        usuario.name = request.body.name || usuario.name
        usuario.phone = request.body.phone || usuario.phone
        usuario.type = request.body.type || usuario.type
        usuario.save()
        
        //console.log(request.body.ecwidUserId)
        // Then, update the corresponding user on Ecwid.
        // Verify user's existence on Ecwid API by their email
        
        const ecwidUser = await axios.get( `${process.env.ECWID_API_URL}/customers/${request.body.ecwidUserId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: process.env.IDELIKA_ACCESS_TOKEN
            },
            //params: { email: request.body.email }
        } )

        if (ecwidUser) {
            await axios.put(`${process.env.ECWID_API_URL}/customers/${request.body.ecwidUserId}`, {
                billingPerson: {
                    name: request.body.name,
                    phone: request.body.phone,
                },
            }, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: process.env.IDELIKA_ACCESS_TOKEN
                },
            })
        } else {
            console.log(`No se encontró usuario en Ecwid con id ${request.body.ecwidUserId} para actualizar.`)
        }

        return response.status(200).json({
            userId: usuario._id,
            ecwidUserId: usuario.ecwidUserId,
            type: usuario.type,
            email: usuario.email,
            phone: usuario.phone,
            name: usuario.name,
            active: usuario.active,
            accessToken: usuario.accessToken,
            refreshToken: usuario.refreshToken
        })

        // PENDING: UPDATE DATA ON ECWID
    } catch (error) {
        console.error( error )
        return response.status(500).json( { status: 500, message: error } )
    }
} )

// Delete one 
router.delete( '/:id', ( request, response ) => {
    response.send( `Delete one user: ${ request.params.id }` )
} )

// Login
router.post( '/login', async ( request, response ) => {
        const usuario = await Usuario.findOne( { email: request.body.email } )
        if( usuario == null ) return response.status(404).json( { status: 404, message: "No se encontró el usuario" } )
        if( usuario.active === false ) return response.status(403).json( { status: 403, message: "Es necesario activar su cuenta desde el correo de activación que le enviamos." } )
        
    try {
        if ( ! await bcrypt.compare( request.body.password, usuario.password ) ) {            
            console.log( `Authentication FAILED for user ${ usuario.email } from ${ request.ip  }` )
            return response.status(401).json( { status: 401, message: "Credenciales inválidas" } )
        }
        // Generate token
        const usuarioObject = { email: usuario.email }
        const accessToken = generateAccessToken( usuarioObject )
        const refreshToken = jwt.sign( usuarioObject, process.env.REFRESH_TOKEN_SECRET )
        RefreshToken.create( { refreshToken } )
        console.log( `Authentication SUCCESSFUL for user ${ usuario.email } from ${ request.ip  }` )
        return response.status(200).json({
            status: 200,
            message: "Autenticación exitosa.",
            userId: usuario._id,
            ecwidUserId: usuario.ecwidUserId,
            type: usuario.type,
            email: usuario.email,
            phone: usuario.phone,
            name: usuario.name,
            active: usuario.active,
            accessToken,
            refreshToken
        })
        // refreshToken route is located in ./auth.js
    } catch (error) {
        console.error( error )
        return response.status(500).json( { status: 500, message: error } )
    }
} )


// Middleware (useful for server side validations)
router.param( 'id', ( request, response, next, id ) => {
    next()
} )

module.exports = router