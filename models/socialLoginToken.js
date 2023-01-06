const mongoose = require("mongoose");

const socialLoginTokenSchema = new mongoose.Schema({
    usuarioId: {
        type: String,
        required: true,
        unique: true,
    },
    googleLoginToken: {
        type: String,
        default: null,
    },
    appleLoginToken: {
        type: String,
        default: null,
    }
})

module.exports = mongoose.model("SocialLoginToken", socialLoginTokenSchema, "SocialLoginTokens")