const mongoose = require( `mongoose` )

const preferenciaSchema = new mongoose.Schema({
    dias: {
        type: Array,
        required: true,
        default: [1,1,1,1,1,0,0],
    },
    horaInicial: {
        type: String,
    },
    horaFinal: {
        type: String,
    },
})

module.exports = mongoose.model( `Preferencia`, preferenciaSchema )