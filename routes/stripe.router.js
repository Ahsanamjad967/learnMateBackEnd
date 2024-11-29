const { createSession, verifyCheckout } = require('../controllers/stripe.controller')
const { isLoggedIn } = require('../middlewares/auth.middleware')
const upload = require('../middlewares/multer.middleware')

const router=require('express').Router()
router.post('/createSession',isLoggedIn,upload.none(),createSession)
router.post('/verifyCheckout',upload.none(),verifyCheckout)
module.exports=router