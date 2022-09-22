const mongoose = require( `mongoose` )

const productSchema = new mongoose.Schema({
    categoryId: {
        
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
    featuredImage: {
        type: String,
    },
})

module.exports = mongoose.model( `Category`, categorySchema, 'categories' )