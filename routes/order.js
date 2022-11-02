require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()

router.post('/', async (req, res) => {
  try {
    return response.status(200).json(req.body)
  } catch (error) {
    res.status(error.statusCode).json(error)
  }
    
});

module.exports = router;