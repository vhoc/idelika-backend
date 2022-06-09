const mongoose = require( `mongoose` )

const preferenciaSchema = new mongoose.Schema({
    usuarioId: {
        type: Number,
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
        type: Date,
        required: true,
        default: '1900-01-01T16:00:00.000Z',
    },
    horaFinal: {
        type: Date,
        required: true,
        default: '1900-01-01T11:00:00.000Z',
    },
    horaInicialExcepcion: {
        type: Date,
    },
    horaFinalExcepcion: {
        type: Date,
    },
})

module.exports = mongoose.model( `Preferencia`, preferenciaSchema, 'preferencias' )