require( 'dotenv' ).config()
const { response } = require('express');
const express = require( 'express' )
const router = express.Router()
const axios = require('axios')

// Get Ecwid's user details
router.get('/user/:id', async (request, response) => {
  try {
    const ecwidUser = await axios.get( `${process.env.ECWID_API_URL}/customers/${request.params.id}`, {
      method: 'GET',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: process.env.IDELIKA_ACCESS_TOKEN
      },
  } )

  if (ecwidUser.data.items.length > 0) {

    // Adapt customerGroupNames to Tiers for the App
    const tiers = {
      "General": 0,
      "Tier 0": 0,
      "Tier 1": 1,
      "Tier 2": 2,
      "Tier 3": 3,
      "Tier 4": 4,
    }

    return response.status(200).json({
      ecwidUserId: response.data.id,
      email: response.data.email,
      billingPerson: response.data.billingPerson,
      shippingAddresses: response.data.shippingAddresses,
      tier: tiers[response.data.customerGroupName],
    })
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