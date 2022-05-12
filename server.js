require( 'dotenv' ).config()
const express = require( "express" )
const app = express()
const mongoose = require( 'mongoose' )
const userRouter = require( "./routes/usuarios" )

mongoose.connect( process.env.DATABASE_URL, { useNewUrlParser: true } )
const db = mongoose.connection
db.on( 'error', error => console.error( error ) )
db.once( 'open', () => console.log( `Connected to database.` ) )

app.use( express.static( 'public' ) )
app.use( express.urlencoded( { encoded: true } ) )
app.use( express.json() )

app.use( "/usuarios", userRouter )

app.listen( 3000, () => console.info( `West Telco Backend Started` ) )