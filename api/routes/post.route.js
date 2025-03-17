import express from 'express'
import { protect } from '../middleware/auth.js'
import { commentOnPost, createPost, deletePost, likeUnlikePost } from '../controllers/post.controller.js'

const router = express.Router()

router.post("/create", protect, createPost)
router.post("/like/:id", protect, likeUnlikePost)
router.post("/comment/:id", protect, commentOnPost)
router.delete("/delete/:id", protect, deletePost)

export default router