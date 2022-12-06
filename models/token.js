const mongoose = require(`mongoose`)
const Schema = mongoose.Schema

const tokenSchema = new Schema({
    usuarioId: {
        type: String,
        required: true,
        unique: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 2630000,
    }
})

module.exports = mongoose.model( `Token`, tokenSchema, `tokens` )