require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()

router.post('/', async (req, res) => {
  try {
    return response.json(req.body)
  } catch (error) {
    res.status(error.statusCode).json(error)
  }
    
});

module.exports = router;