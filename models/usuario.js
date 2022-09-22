const mongoose = require( `mongoose` )
//const AutoIncrement = require('mongoose-sequence')(mongoose);

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name:  {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Arquitecto', 'Interiorista', 'Otro'],
    },
    active: {
        type: Boolean,
        required: true,
        default: false,
    },
})

usuarioSchema.set( 'timestamps', true )
//usuarioSchema.plugin(AutoIncrement, {inc_field: '_id'});
module.exports = mongoose.model( `Usuario`, usuarioSchema, 'usuarios' )