const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res, next) => {
  return res.json("API: /secret");
});

router.post(
  '/login',
  passport.authenticate('near', { failureRedirect: '/fail', session: false }),
  (req, res) => {
    const payload = {
      accountId: req.user,
      expires: Date.now() + 3600,
    }
    const token = jwt.sign(JSON.stringify(payload), 'a-fixed-secret-is-not-secure');
    res.json(token)
  }
)

router.get('/secret',
  passport.authenticate('jwt', { session: false, failureRedirect: '/not_authorized'}),
  (req, res) => res.json(`A secret message just for ${req.user}`)
);

router.get('/not_authorized', (req, res, next) => {
  res.json("Not Authorized")
}); 

router.get('/fail', (req, res, next) => {
  res.json(false)
})

module.exports = router;