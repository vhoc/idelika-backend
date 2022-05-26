const mongoose = require( `mongoose` )

const preferenciaSchema = new mongoose.Schema({
    usuarioId: {
        type: String,
        required: true,
        unique: true,
    },
    monday: {
        type: Boolean,
        required: true,
        default: true,
    },
    tuesday: {
        type: Boolean,
        required: true,
        default: true,
    },
    wednesday: {
        type: Boolean,
        required: true,
        default: true,
    },
    thursday: {
        type: Boolean,
        required: true,
        default: true,
    },
    friday: {
        type: Boolean,
        required: true,
        default: true,
    },
    saturday: {
        type: Boolean,
        required: true,
        default: false,
    },
    sunday: {
        type: Boolean,
        required: true,
        default: false,
    },
    horaInicial: {
        type: String,
        required: true,
        default: '09:00',
    },
    horaFinal: {
        type: String,
        required: true,
        default: '17:00',
    },
    horaInicialExcepcion: {
        type: String,
    },
    horaFinalExcepcion: {
        type: String,
    },
})

module.exports = mongoose.model( `Preferencia`, preferenciaSchema, 'preferencias' )