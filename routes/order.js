require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()
const axios = require('axios')

/**
 * PENDING:
 *  Protect this route
 */

router.post('/', async (req, res) => {

  try {
    const order = {
      customerId: req.body.customerId,
      email: req.body.email,
      shippingOption: req.body.shippingOption,
      subtotal: req.body.subtotal,
      total: req.body.total,
      discount: req.body.discount,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentStatus,
      items: req.body.items,
      billingPerson: req.body.billingPerson,
      shippingPerson: req.body.shippingPerson,
      orderComments: req.body.orderComments,
    }
    console.log(order)

    axios.post( `${process.env.ECWID_API_URL}/orders`, order, {
      headers: {
          "method": 'POST',
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: process.env.IDELIKA_ACCESS_TOKEN
      },
  } ).then(data => {
    console.log(data)
    return res.status(201).json(data)
  }).catch(error => {
    console.error(error)
    res.status(500).json(error)
  })
  } catch (error) {
    console.error(error)
    res.status(500).json(error)
  }
    
});

module.exports = router;