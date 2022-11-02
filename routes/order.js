require( 'dotenv' ).config()
const express = require( 'express' )
const router = express.Router()

router.post('/', async (req, res) => {
  try {
    return response.json(req.body)
  } catch (error) {
    console.error(error)
    res.status(500).json(error)
  }
    
});

module.exports = router;