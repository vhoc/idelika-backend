const express = require( 'express' )
const router = express.Router()
const axios = require('axios')
const jwt = require( `jsonwebtoken` )
const { generateAccessToken } = require( '../helpers/generateAccessToken' )
const RefreshToken = require( `../models/refreshToken` )
const Usuario = require( `../models/user` )

router.post("/login", async (request, response) => {
    console.log(request.body)
    const {identityToken} = request.body;
    let appleResponse, name, email, user
    if (request.body.user) { 
        name = request.body.user.name;
        email = request.body.user.email;
    }
    try {
        const clientId = process.env.APPLE_CLIENT_ID;
         // verify token (will throw error if failure)
         appleResponse = await appleSignin.verifyIdToken(identityToken, {
             audience: clientId,
             ignoreExpiration: true, // ignore token expiry (never expires)
         });
         console.log(appleResponse);
         const { sub: appleUserId } = appleResponse;
         if(appleUserId !== request.body.appleUserId) {
            //user ids don't match
            return response.status(422).json({
                status: 422,
                message: "Hubo un error al validar las credenciales.",
            })
         }
    } catch (e) {
        console.log(e)
        return response.status(422).json({
            status: 422,
            message: "Hubo un error al validar las credenciales.",
        })
    }
    try{
        // Verify user's existence on Ecwid API by their email
        const ecwidUser = await axios.get( `${process.env.ECWID_API_URL}/customers`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: process.env.IDELIKA_ACCESS_TOKEN
            },
            params: { email }
        } )

        if (ecwidUser.data.items.length > 0) {

            user = await Usuario.findOne( { email } )

            if (!user) {
                user = new Usuario({
                    ecwidUserId: ecwidUser.data.items[0].id,
                    name,
                    type: 'Otro',
                    email,
                    phone: '',
                    active: true,
                })
                user.save()
                console.log( `New user ${ email } registered.` )
            }

        } else {
            // If email doesnt exist on Ecwid API:
            // Create customer on Ecwid, with tier (customer group) 0
            // Create user on local database
            try {
                const ecwidResponse  = await axios.post( `${process.env.ECWID_API_URL}/customers`, {
                    email: email,
                    customerGroupId: 0,
                    billingPerson: {
                        name: name,
                    }
                }, {
                    headers: {
                        "method": 'POST',
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: process.env.IDELIKA_ACCESS_TOKEN
                    },
                } )
                console.log(`Created on ecwid: ${ecwidResponse.data.id}`)
                user = await Usuario.findOne( { email } )
                if (!user) {
                    user = new Usuario({
                        ecwidUserId: ecwidResponse.data.id,
                        name,
                        type: 'Otro',
                        email,
                        phone: '',
                        active: true,
                    })
                    user.save()
                    console.log( `New user ${ email } registered.` )
                }
            } catch(error) {
                console.error(error)
                return response.status(422).json({
                    status: 422,
                    message: "Hubo un error al crear el usuario en el sistema de la tienda.",
                })
            }
        }

        const usuarioObject = { email }
        const accessToken = generateAccessToken( usuarioObject )
        const refreshToken = jwt.sign( usuarioObject, process.env.REFRESH_TOKEN_SECRET )
        RefreshToken.create( { refreshToken } )
        console.log( `Authentication SUCCESSFUL for user ${ user.email } from ${ request.ip  }` )
        return response.status(200).json({
            status: 200,
            message: "Autenticación exitosa.",
            userId: user._id,
            ecwidUserId: user.ecwidUserId,
            type: user.type,
            email: user.email,
            phone: user.phone,
            name: user.name,
            active: user.active,
            accessToken,
            refreshToken
        })
    } catch (error) {
        console.error( error )
        return response.status(500).json( { status: 500, message: "Ha ocurrido un error al intentar el registro." } )
    }
})
 
 module.exports = router;