const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/login',
           passport.authenticate('near', {failureRedirect: '/', successRedirect: '/secret', successMessage: true, failureMessage: true}))

router.get('/logout', (req, res, next) => {req.logout((err)=>{}); res.redirect('/')});
 
module.exports = router;