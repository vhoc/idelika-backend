require( 'dotenv' ).config()
const { response } = require('express');
const express = require( 'express' )
const router = express.Router()
const axios = require('axios')
const { getUserDiscount } = require( `../helpers/ecwidUserData` )

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
    const calculate = await getUserDiscount(ecwidUser.data.id, ecwidUser.data.email)

    //console.log(calculate.data.discountInfo[0].value)

    return response.status(200).json({
      ecwidUserId: ecwidUser.data.id,
      email: ecwidUser.data.email,
      billingPerson: ecwidUser.data.billingPerson,
      shippingAddresses: ecwidUser.data.shippingAddresses,
      tier: tiers[ecwidUser.data.customerGroupName],
      discount: {
        type: calculate.type,
        value: calculate.value || 0
      }
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

router.get(`/shippingMethods`, async (request, response) => {
  try {
    const shippingOptions = await axios.get(`${process.env.ECWID_API_URL}/profile/shippingOptions`, {
      method: 'GET',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: process.env.IDELIKA_ACCESS_TOKEN
      },
    })

    if (shippingOptions.data) {
      return response.status(200).json(shippingOptions.data)
    } else {
      return response.status(404).json({
        message: "No existen métodos de envío"
      })
    }
  } catch (error) {
    console.error(error)
    response.status(500).json(error)
  }
})

/**
 * Gets the address saved in the device, then uses it to determine
 * the shipping cost to be applied to that address/
 */

router.post(`/shippingCost`, async (request, response) => {
  const address = request.body

  // Get and prepare shipping methods from Ecwid
  let shippingOptions

  try {
    shippingOptions = await axios.get(`${process.env.ECWID_API_URL}/profile/shippingOptions`, {
      method: 'GET',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: process.env.IDELIKA_ACCESS_TOKEN
      },
    })
    console.log()
  } catch (error) {
    shippingOptions = null
    return response.status(404).json({
      message: "No se encontraron métodos de envíos en el sistema remoto."
    })
  }

  // Jalisco or Other States?
  console.log(shippingOptions)


  try {
    if (address) {
      return response.status(200).json({...address, shippingCost: 10})
    } else {
      return response.status(404).json({
        message: "No se encontró un costo de envío"
      })
    }
  } catch (error) {
    console.error(error)
    response.status(500).json(error)
  }

  console.log(JSON.stringify(address))
})

module.exports = router;