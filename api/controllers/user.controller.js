import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

export const getUserProfile = async (req, res) => {
    const { username } = req.params

    try{
        const user = await User.findOne({ username }).select('-password')
        if(!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json(user)
    }catch(error) {
        return res.status(500).json({ message: error.message })
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (!userToModify || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user._id.equals(id)) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            return res.status(200).json({ message: 'Unfollowed successfully' });
        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            const newNotification = new Notification({
                from: req.user._id,
                to: userToModify._id,
                type: 'follow',
            })

            await newNotification.save()

            return res.status(200).json({ message: 'Followed successfully' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id
        const usersFollowedByMe = await User.findById(userId).select('following')

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                }
            },
            {
                $sample: { size: 10 }
            }
        ])

        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0, 4)

        suggestedUsers.forEach(user => user.password = null)
        res.status(200).json(suggestedUsers)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const updateUserProfile = async (req, res) => {
    try{
        const { username, fullName, email, currentPassword, newPassword, bio, link } = req.body
        let { profileImg, coverImg } = req.body

        const userId = req.user._id

        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ message: 'Current password and new password must be provided together' })
        }

        if(currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' })
            }
            if(newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters long' })
            }
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
        }

        if(profileImg) {
            if(user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]) // deletes old image from profile
            }

            const uploadResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadResponse.secure_url
        }

        if(coverImg) {
            if(user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]) // deletes old image from profile
            }

            const uploadResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadResponse.secure_url
        }

        user.fullName = fullName || user.fullName
        user.email = email || user.email
        user.username = username || user.username
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()

        user.password = null

        return res.status(200).json({ message: 'Profile updated successfully', user })
    }catch(error) {
        return res.status(500).json({ message: error.message })
    }
}