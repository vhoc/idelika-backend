var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let params = {
    active: { home: true }
  };

  //res.render('index', params);
  res.send('🪑 Idelika© Backend v0.1')
});

router.get('/test', (req, res) => {
  res.json({message: '🪑 Idelika© Backend v0.1'})
})

module.exports = router;