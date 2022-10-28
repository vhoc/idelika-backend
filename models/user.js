const mongoose = require( `mongoose` )

const userSchema = new mongoose.Schema({
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
    tier: {
        type: Number,
        required: true,
        default: 0,
        enum: [0, 1, 2, 3, 4, 5],
    },
    active: {
        type: Boolean,
        required: true,
        default: false,
    },
})

usuarioSchema.set( 'timestamps', true )
//usuarioSchema.plugin(AutoIncrement, {inc_field: '_id'});
module.exports = mongoose.model( `User`, userSchema, 'users' )