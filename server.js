const express = require( "express" )
const app = express()
const userRouter = require( "./routes/users" )

app.use( express.static( 'public' ) )
app.use( express.urlencoded( { encoded: true } ) )
app.use( express.json() )

app.use( "/users", userRouter )

app.listen( 3000 )