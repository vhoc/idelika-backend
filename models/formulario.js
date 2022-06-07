const mongoose = require( `mongoose` )

/**
 * Pendientes campos multiopción
 */

const camposSchema = new mongoose.Schema({
    tipoCampo: { type: String },
    titulo: { type: String, },
    tipo: { type: String, },
    inputId: { type: String }
})

const formularioSchema = new mongoose.Schema({
    usuarioId: {
        type: String,
        required: true,
        unique: true,
    },
    logotipo: {
        type: String,
        default: "https://via.placeholder.com/170x60.png?text=SUBA+UN+LOGO",
    },
    titulo: {
        type: String,
        required: true,
        default: 'Programe una reunión'
    },
    mensajeInicial: {
        type: String,
        required: true,
        default: 'Utilice éste formulario para agendar una reunión.'
    },
    camposObligatorios: {
        type: [camposSchema],
        required: true,
        default: [
            { titulo: "Nombre", tipo: "text", inputId: "nombre", },
            { titulo: "Apellido Paterno", tipo: "text", inputId: "aPaterno", },
            { titulo: "Apellido Materno", tipo: "text", inputId: "aMaterno", },
            { titulo: "Correo Electrónico", tipo: "email", inputId: "email", },
            { titulo: "Asunto de la Reunión", tipo: "textarea", inputId: "asunto", },
        ],
    },
    camposAdicionales: {
        type: [camposSchema],
    },
    mensajeConfirmacion: {
        type: String,
        required: true,
        default: 'Gracias por agendar una cita.'
    }
})

module.exports = mongoose.model( `Formulario`, formularioSchema, 'formularios' )