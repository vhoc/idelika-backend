const mongoose = require( `mongoose` )
const uuid = require('uuid');

const licenseKeySchema = new mongoose.Schema({
    key: {
        type: String,
        default: () => {
            return uuid.v4()
        },
        required: true,
    },
    usuarioId: {
        type: String,
        default: '',
    },
    usuarioNombre: {
        type: String,
        default: '',
    },
    usuarioEmpresa: {
        type: String,
        default: '',
    },
    asignada: {
        type: Boolean,
        default: false,
    }
})

module.exports = mongoose.model( `LicenseKey`, licenseKeySchema, `licenseKeys` )