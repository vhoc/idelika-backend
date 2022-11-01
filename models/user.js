const mongoose = require( `mongoose` )

const userSchema = new mongoose.Schema({
    ecwidUserId: {
        type: Number,
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
    name:  {
        type: String,
        required: true,
    },
    phone: {
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

userSchema.set( 'timestamps', true )
//usuarioSchema.plugin(AutoIncrement, {inc_field: '_id'});
module.exports = mongoose.model( `User`, userSchema, 'users' )