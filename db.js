const mongoose = require( `mongoose` )

module.exports = connection = async () => {
    try {
        const connectionParams = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
        }
        await mongoose.connect( process.env.DATABASE_URL, connectionParams )
        console.log( `Connected to database` )
    } catch ( error ) {
        console.log( error, `Could not connect to database` )
    }
}