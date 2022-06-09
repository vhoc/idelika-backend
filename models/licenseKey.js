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
    empresa: {
        type: String,
        default: '',
    },
    usersAvailable: {
        type: Number,
        default: 0
    },
})

module.exports = mongoose.model( `LicenseKey`, licenseKeySchema, `licenseKeys` )