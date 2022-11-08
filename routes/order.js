require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()
const { getUserDiscount } = require( `../helpers/ecwidUserData` )

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

  const discount = await getUserDiscount(req.body.customerI, req.body.email)

  try {
    const order = {
      customerId: req.body.customerId,
      email: req.body.email,
      shippingOption: req.body.shippingOption,
      subtotal: req.body.subtotal,
      total: req.body.total,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentStatus,
      items: req.body.items,
      privateAdminNotes: req.body.privateAdminNotes,
      discount: discount.value
    }
    return res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json(error)
  }
    
});

module.exports = router;