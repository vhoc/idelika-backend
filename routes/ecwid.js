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

router.post(`/available-shipping-methods`, async (request, response) => {
  const address = request.body

  // Initiate the container for the shipping options from Ecwid.
  let shippingOptions

  /**
   * Initiate the containers for the available shipping methods,
   * one of which the user will receive in the App.
   * An aditional object will be pushed into each one of the arrays.
   * This aditional object will be the alternate method the user can select from,
   * and it will depend on the user's address from the request.
   * For instance:
   *    [
          {
            "name": "Self Pickup",
            "costPercent": 0
          },
          { <-- This second object will be added below.
            "name": "Otras partes de Jalisco",
            "costPercent": 10
          }
        ]
  */
  // For now, they will only contain the Self Pickup option.
  let responseGdlMethods = [ { name: "Self Pickup", costPercent: 0 } ]
  let responseJaliscoMethods = [ { name: "Self Pickup", costPercent: 0 } ]
  let responseMexicoCentroMethods = [ { name: "Self Pickup", costPercent: 0 } ]
  let responseMexicoInteriorMethods = [ { name: "Self Pickup", costPercent: 0 } ]

  // First get all shipment methods from Ecwid and store them in the variable: shippingOptions
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

  // Add to the shipping methods the corresponding alternate method
  // To keep this functioning the names of the methods on Ecwid SHOULD NEVER CHANGE.
  // The States assigned to each shipping zome SHOULD also NEVER CHANGE because they're also hardocded here.
  // But the Flat Rate amounts can be changed freely anytime
  // as long as the Rate Type ALWAYS BE "PERCENT".
  if ( shippingOptions.data && shippingOptions.data.length >= 1 ) {
    const guadalajaraMethod = shippingOptions.data.filter(object => { return object.title === 'Envio Guadalajara y Zona Metropolitana' })    
    responseGdlMethods.push({ name: guadalajaraMethod[0].title, costPercent: guadalajaraMethod[0].flatRate?.rate || 0 })

    const jaliscoMethod = shippingOptions.data.filter(object => { return object.title === 'Otras partes de Jalisco' })
    responseJaliscoMethods.push({ name: jaliscoMethod[0].title, costPercent: jaliscoMethod[0].flatRate?.rate || 0 })

    const mexicoCentroMethod = shippingOptions.data.filter(object => { return object.title === 'Transporte terrestre México' })
    responseMexicoCentroMethods.push({ name: mexicoCentroMethod[0].title, costPercent: mexicoCentroMethod[0].flatRate?.rate || 0 })

    const mexicoInteriorMethod = shippingOptions.data.filter(object => { return object.title === 'Transporte terrestre interior de México' })
    responseMexicoInteriorMethods.push({ name: mexicoInteriorMethod[0].title, costPercent: mexicoInteriorMethod[0].flatRate?.rate || 0 })

    /**
     * Now we will evaluate two fields from the request:
     * 1) address.city, and 2) address.state
     * An if conditional will do for the city evaluation
     * and a switch statement seems appropiate for the state.
     */
    if (
      address.city.toLowerCase() === 'guadalajara' ||
      address.city.toLowerCase() === 'zapopan' ||
      address.city.toLowerCase() === 'tonala' ||
      address.city.toLowerCase() === 'tonalá' ||
      address.city.toLowerCase() === 'salto' ||
      address.city.toLowerCase() === 'el salto' ||
      address.city.toLowerCase() === 'tlaquepaque' ||
      address.city.toLowerCase() === 'tlajomulco' &&
      address.state.toLowerCase() === 'jalisco'
    ) {
      // Return the options for the people living in Guadalajara or its Metropolitan Zone
      return response.status(200).json(responseGdlMethods)
    }

    // Other municipalities from Jalisco.
    if ( address.state.toLowerCase() === 'jalisco' ) {
      return response.status(200).json(responseJaliscoMethods)
    }

    // Now we evaluate the state. This will be quite long...
    switch (address.state.toLowerCase()) {
      // Zona Centro
      case 'aguascalientes': case 'ciudad de méxico': case 'colima': case 'guanajuato': case 'guerrero': case 'hidalgo': case 'michoacán': case 'morelos': case 'méxico': case 'nayarit': case 'puebla': case 'querétaro': case 'san luis potosí': case 'zacatecas':
        return response.status(200).json(responseMexicoCentroMethods)
        break;
      // Norte y Sur
      case 'chihuahua': case 'cuahuila': case 'durango': case 'nuevo león': case 'oaxaca':  case 'quintana roo': case 'sinaloa': case 'sonora': case 'tabasco': case 'tamaulipas': case 'tlaxcala': case 'veracruz': case 'yucatán':
        return response.status(200).json(responseMexicoInteriorMethods)
        break;
      // Default
      default:
        return response.status(200).json(responseMexicoInteriorMethods)
        break;
    }
    
  }


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