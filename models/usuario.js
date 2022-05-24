const mongoose = require( `mongoose` )
const uuid = require('uuid');

const usuarioSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => {
            return uuid.v4()
        },
        required: true,
    },
    nombre: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    empresa: {
        type: String,
    },
    avatar: {
        type: String,
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
})

usuarioSchema.set( 'timestamps', true )

module.exports = mongoose.model( `Usuario`, usuarioSchema, 'usuarios' )