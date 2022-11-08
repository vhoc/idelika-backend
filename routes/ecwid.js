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

  if (ecwidUser.data) {

    // Adapt customerGroupNames to Tiers for the App
    const tiers = {
      "General": 0,
      "Tier 0": 0,
      "Tier 1": 1,
      "Tier 2": 2,
      "Tier 3": 3,
      "Tier 4": 4,
    }
    //console.log(ecwidUser.data)

    // Get user discount:
    
    const discount = await axios.post(`${process.env.ECWID_API_URL}/order/calculate`, {
        email: "sucorees@gmail.com",
        customerId: 202787982,
        items: [
          {
            "productId": 0,
            "quantity": 1
          }
        ]
    }, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: process.env.IDELIKA_ACCESS_TOKEN
      },
    })

    console.log(discount)

    return response.status(200).json({
      ecwidUserId: ecwidUser.data.id,
      email: ecwidUser.data.email,
      billingPerson: ecwidUser.data.billingPerson,
      shippingAddresses: ecwidUser.data.shippingAddresses,
      tier: tiers[ecwidUser.data.customerGroupName],
    })
  } else {
    return response.status(404).json({
      message: "No se encontró el usuario"
    })
  }

  } catch (error) {
    console.error(error)
    response.status(500).json(error)
  }

});

module.exports = router;