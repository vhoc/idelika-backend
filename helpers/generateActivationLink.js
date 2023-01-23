const Token = require( `../models/token` )
const crypto = require( `crypto` )

// New method
require( 'dotenv' ).config()
const jwt = require( `jsonwebtoken` )

/*
const generateActivationLink = async ( usuario ) => {
    let token = await Token.findOne({ usuarioId: usuario._id });
    if (!token) {
        token = await new Token({
            usuarioId: usuario._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
    }

    const link = `${process.env.FRONTEND_URL}api/auth/activate/${usuario._id}/${token.token}`;
    // TODO: CREAR RUTA /activate/
    return link
}*/
const generateActivationLink = async ( user ) => {
    const token = getToken(user)
    const link = `${process.env.FRONTEND_URL}api/auth/activate/${usuario._id}/${token}`;
    return link
}

// New method
const getToken = (payload) => {
    return jwt.sign({
        data: payload
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
}

const getTokenData = (token) => {
    let data = null

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            console.log(`Error al obtener datos del token`)
        } else {
            data = decoded
        }
    } )

    return data
}

module.exports = { generateActivationLink, getToken, getTokenData }
//https://idelika.xneighbor.com/api/auth/activate/63619a3c4900f95f40df842f/56975630a6a9983f8fa40accf23cc1ea13772daf77cf03d7bdadbba917766d1c