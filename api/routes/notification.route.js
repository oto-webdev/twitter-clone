import express from 'express'
import { protect } from '../middleware/auth.js'
import { deleteNotifications, getNotifications } from '../controllers/notification.controller.js'

const router = express.Router()

router.get("/", protect, getNotifications)
router.delete("/:id", protect, deleteNotifications)

export default router