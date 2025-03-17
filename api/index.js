import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'
import postRoute from './routes/post.route.js'
import notificationRoute from './routes/notification.route.js'
import connectDB from './lib/connect.db.js'

config()

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(helmet())

app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/posts', postRoute)
app.use("/api/notifications", notificationRoute)

const startServer = async () => {
    await connectDB()
    app.listen(process.env.PORT, () => {
        console.log(`http://localhost:${process.env.PORT}`)
    })
}

startServer()