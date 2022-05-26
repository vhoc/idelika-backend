const mongoose = require( `mongoose` )

const preferenciaSchema = new mongoose.Schema({
    usuarioId: {
        type: String,
        required: true
    },
    lunes: {
        type: Boolean,
        required: true,
        default: true,
    },
    martes: {
        type: Boolean,
        required: true,
        default: true,
    },
    miercoles: {
        type: Boolean,
        required: true,
        default: true,
    },
    jueves: {
        type: Boolean,
        required: true,
        default: true,
    },
    viernes: {
        type: Boolean,
        required: true,
        default: true,
    },
    sabado: {
        type: Boolean,
        required: true,
        default: false,
    },
    domingo: {
        type: Boolean,
        required: true,
        default: false,
    },
    horaInicial: {
        type: String,
    },
    horaFinal: {
        type: String,
    },
})

module.exports = mongoose.model( `Preferencia`, preferenciaSchema, 'preferencias' )