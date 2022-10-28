var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let params = {
    active: { home: true }
  };

  res.render('index', params);
});

router.get('/test', (req, res) => {
  res.json({message: 'Test successful'})
})

module.exports = router;