import express from 'express'
import { protect } from '../middleware/auth.js'
import { followUnfollowUser, getSuggestedUser, getUserProfile, updateUserProfile } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/profile/:username', protect, getUserProfile)
router.get("/suggested", protect, getSuggestedUser)
router.post("/follow/:id", protect, followUnfollowUser)
router.post("/update", protect, updateUserProfile)

export default router