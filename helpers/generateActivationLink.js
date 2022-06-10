const Token = require( `../models/token` )
const crypto = require( `crypto` )

const generateActivationLink = async ( usuario ) => {
    let token = await Token.findOne({ usuarioId: usuario._id });
    if (!token) {
        token = await new Token({
            usuarioId: usuario._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
    }

    const link = `${process.env.BASE_URL}/auth/activate/${usuario._id}/${token.token}`;
    // TODO: CREAR RUTA /activate/
    return link
}

module.exports = { generateActivationLink }