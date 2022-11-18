const express = require( 'express' )
const router = express.Router()
const fs = require("fs");
const AppleAuth = require("apple-auth");
const axios = require('axios')
const jwt = require( `jsonwebtoken` )
const { generateAccessToken } = require( '../helpers/generateAccessToken' )
const RefreshToken = require( `../models/refreshToken` )
const Usuario = require( `../models/user` )
var path = require('path');


const config = {
    "client_id": process.env.APPLE_CLIENT_ID,
    "team_id": process.env.APPLE_TEAM_ID,
    "key_id": process.env.APPLE_KEY_ID,
    "redirect_uri": process.env.APPLE_REDIRECT_URI,
    "scope": "name email"
}

const keyPath = path.join(__dirname, '..', 'config', process.env.APPLE_AUTH_KEY);
let auth = new AppleAuth(
    config,
    fs.readFileSync(keyPath).toString(), //read the key file
    "text"
  );

router.post("/login", async (request, response) => {
    try {
        //authenticate our code we recieved from apple login with our key file
        const appleResponse = await auth.accessToken(request.body.authorization.code);
        // decode our token
        const idToken = jwt.decode(appleResponse.id_token);
        
        //extract email from idToken
        const email = idToken.email;
        let name
        
        //check if user exists in the returned response from Apple
        //Apple returns the user only once, so you might want to save their details
        // in a database for future logins
        if (request.body.user) { 
            name = JSON.parse(request.body.user).name;
        }
        let user

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