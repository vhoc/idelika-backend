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
        default: () => { 
            const date = new Date( Date.now() )
            return date.setHours( 9, 0, 0 )
        },
    },
    horaFinal: {
        type: Date,
        required: true,
        default: () => { 
            const date = new Date( Date.now() )
            return date.setHours( 17, 0, 0 )
        },
    },
    horaInicialExcepcion: {
        type: Date,
    },
    horaFinalExcepcion: {
        type: Date,
    },
})

module.exports = mongoose.model( `Preferencia`, preferenciaSchema, 'preferencias' )