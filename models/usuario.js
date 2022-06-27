const mongoose = require( `mongoose` )
const AutoIncrement = require('mongoose-sequence')(mongoose);

const usuarioSchema = new mongoose.Schema({
    _id: Number,
    nombre: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    licenseKey: {
        type: String,
        required: true,
    },
    empresa: {
        type: String,
        required: false,
        unique: false,
    },
    buttonLink: {
        type: String,
        required: true,
        unique: true,
    },
    refreshTokenZoom: {
        type: String,
        default: '',
    },
    refreshTokenOutlook: {
        type: String,
        default: '',
    },
    zoom: {
        type: Boolean,
        default: false,
    },
    outlook: {
        type: Boolean,
        default: false,
    },
    avatar: {
        type: String,
    },
    active: {
        type: Boolean,
        required: true,
        default: false,
    },
})

usuarioSchema.set( 'timestamps', true )
usuarioSchema.plugin(AutoIncrement, {inc_field: '_id'});
module.exports = mongoose.model( `Usuario`, usuarioSchema, 'usuarios' )