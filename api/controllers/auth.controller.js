import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"

export const signup = async (req, res) => {
    try{
        const { username, fullName, email, password } = req.body
        if(!username || !fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        if(password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' })
        }

        if(!email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email' })
        }

        const userExists = await User.findOne({ email })
        if(userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            username,
            fullName,
            email,
            password: hashedPassword
        })

        const token = generateTokenAndSetCookie(user._id, res)

        return res.status(201).json({ user, token })
    }catch(error) {
        return res.status(500).json({ message: error.message })
    }
}

export const signin = async (req, res) => {
    try{
        const { email, password } = req.body
        if(!email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const user = await User.findOne({ email })
        if(!user) {
            return res.status(400).json({ message: 'User does not exist' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        const token = generateTokenAndSetCookie(user._id, res)

        return res.status(200).json({ user, token })
    }catch(error) {
        return res.status(500).json({ message: error.message })
    }
}

export const signout = async (req, res) => {
    try{
        res.clearCookie('token', "", { maxAge: 0 })
        return res.status(200).json({ message: 'Signed out successfully' })
    }catch(error) {
        return res.status(500).json({ message: error.message })
    }
}

export const getMe = async (req, res) => {
    try{
        const user = await User.findById(req.user._id)
        return res.status(200).json({ user })
    }catch(error) {
        return res.status(500).json({ message: error.message })
    }
}