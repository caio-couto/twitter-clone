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
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);