const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
  res.render('index', {user: req.user});
});

router.get('/secret', async (req, res, next) => {
  if(!req.isAuthenticated()){
    return res.redirect("/");
  }
  return res.render('secret', {"user": req.user});
});

module.exports = router;