const mongoose = require( `mongoose` )

const camposSchema = new mongoose.Schema({
    nombre: { type: String, },
    valor: { type: String, }
})

const reunionSchema = new mongoose.Schema({
    fecha: {
        type: String,
    },
    hora: {
        type: String,
    },
    camposObligatorios: {
        type: [camposSchema],
        required: true,
    },
    camposAdicionales: {
        type: [camposSchema],
    },
})

module.exports = mongoose.model( `Reunion`, reunionSchema, 'reuniones' )