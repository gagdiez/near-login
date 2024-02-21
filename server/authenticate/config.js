const MESSAGE = "log me in"
const APP = "http://localhost:3000"
const CHALLENGE = Buffer.from(Array.from(Array(32).keys()))
const cURL = "http://localhost:1234"

module.exports = { MESSAGE, CHALLENGE, APP, cURL }