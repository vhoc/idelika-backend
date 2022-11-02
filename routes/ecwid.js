require( 'dotenv' ).config()
const { response } = require('express');
const express = require( 'express' )
const router = express.Router()

// Get Ecwid's user details
router.get('/user', async (req, res) => {
  try {
    const ecwidUser = await axios.get( `${process.env.ECWID_API_URL}/customers`, {
      method: 'GET',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: process.env.IDELIKA_ACCESS_TOKEN
      },
      params: { email: request.body.email }
  } )

  if (ecwidUser.data.items.length > 0) {
    return response.status(200).json( ecwidUser.data.items[0] )
  } else {
    return response.status(404).json({
      message: "No se encontró el usuario"
    })
  }

  } catch (error) {
    console.error(error)
    res.status(500).json(error)
  }
    
});

module.exports = router;