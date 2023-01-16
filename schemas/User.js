const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
{
    firstName: 
    {
        type: String,
        required: true,
        trim: true
    },
    lastName: 
    {
        type: String,
        required: true,
        trim: true
    },
    username: 
    {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: 
    {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: 
    {
        type: String,
        required: true
    },
    profilePic:
    {
        type: String,
        default: '/images/profilePic.jpeg'
    },
    coverPhoto:
    {
        type: String
    },
    likes: 
    [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Post'
        }
    ],
    retweets: 
    [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Post'
        }
    ],
    following: 
    [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    followers: 
    [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ]
},
{
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);