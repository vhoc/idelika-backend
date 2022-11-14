require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()
const axios = require('axios')

router.post('/', async (req, res) => {
  /**
   * From here we'll create the order directly on Ecwid
   * Data obtained from the app:
   *  - customerId
   *  - shippingOption
   *  - subtotal
   *  - total
   *  - paymentMethod ("Pagar con transferencia bancaria", "Credit or debit card")
   *  - paymentStatus (PAID, AWAITING_PAYMENT) (Will depend on the paymentMethod. Card = paid, Transfer = awaiting)
   *  - fulfillmentStatus (AWAITING_PROCESSING)
   *  - items[]
   *  - privateAdminNotes?
   * 
   * With customerId calculate/obtain:
   *  - customerGroup
   *  - discount
   *  - billingPerson
   *  - shippingPerson
   * 
   * Then finally, create the order on ecwid.
   */


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
      privateAdminNotes: req.body.privateAdminNotes,
    }
    console.log(`Order received: ${order}`)

    axios.post( `${process.env.ECWID_API_URL}/orders`, order, {
      headers: {
          "method": 'POST',
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: process.env.IDELIKA_ACCESS_TOKEN
      },
  } ).then(data => {
    console.log(data)
    return res.json(data)
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