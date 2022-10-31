require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()
const stripe = require( 'stripe' )( process.env.STRIPE_SECRET_KEY )

router.post('/payment-sheet', async (req, res) => {
    // Use an existing Customer ID if this is a returning customer.
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2022-08-01'}
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099,
      currency: 'eur',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

router.get('/countryside', async (req, res) => {
    res.json({
        pk: process.env.STRIPE_PUBLISHABLE_KEY
    })
})

module.exports = router;