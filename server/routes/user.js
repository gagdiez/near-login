const express = require('express');
const passport = require('passport');
const router = express.Router();

function handleError(req, res, next) {
    if(req.query.hasOwnProperty("error")){
     return res.redirect('/')   
    }
    next()
}

router.get('/login', handleError,
           passport.authenticate('near', {failureRedirect: '/', successRedirect: '/secret', successMessage: true, failureMessage: true}))

router.get('/logout', (req, res, next) => {req.logout((err)=>{}); res.redirect('/')});
 
module.exports = router;