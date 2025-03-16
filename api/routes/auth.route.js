import express from 'express'
import { getMe, signin, signout, signup } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post("/signup", signup)
router.post("/signin", signin)
router.post("/signout", signout)

router.get("/me", protect, getMe)

export default router
