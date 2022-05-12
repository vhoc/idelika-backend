const mongoose = require( `mongoose` )

const camposSchema = new mongoose.Schema({
    titulo: { type: String, },
    tipo: { type: String, }
})

const formularioSchema = new mongoose.Schema({
    logotipo: {
        type: String,
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
            { titulo: "Nombre", tipo: "text", },
            { titulo: "Apellido Paterno", tipo: "text", },
            { titulo: "Apellido Materno", tipo: "text", },
            { titulo: "Correo Electrónico", tipo: "email", },
            { titulo: "Asunto de la Reunión", tipo: "textarea", },
        ],
    },
    camposAdicionales: {
        type: [camposSchema],
    },
    mensajeConfirmacion: {
        type: String,
        required: true,
        default: 'Gracias por agendar una cita.'
    },
    botonConfirmar: {
        type: String,
        required: true,
        default : '#',
    },
})

module.exports = mongoose.model( `Formulario`, formularioSchema, 'formularios' )