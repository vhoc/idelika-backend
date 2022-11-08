require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()

router.post('/', async (req, res) => {
  /**
   * From here we'll create the order directly on Ecwid
   * Data obtained from the app:
   *  - customerId
   *  - shippingOption
   *  - subtotal
   *  - total
   *  - paymentMethod (PAID, AWAITING_PAYMENT)
   *  - paymentStatus
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
    return res.json(req.body)
  } catch (error) {
    console.error(error)
    res.status(500).json(error)
  }
    
});

module.exports = router;