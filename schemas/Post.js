const mongoose = require('mongoose');

const postScheema = new mongoose.Schema(
{
    content:
    {
        type: String, trim: true
    },
    postedBy:
    {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    pinned:
    {
        type: Boolean
    },
    likes: 
    [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    retweetUsers: 
    [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    retweetData: 
    {
        type: mongoose.Types.ObjectId,
        ref: 'Post'
    },
    replyTo: 
    {
        type: mongoose.Types.ObjectId,
        ref: 'Post'
    },
    pinned:
    {
        type: Boolean
    }
}, 
{
    timestamps: true
});

module.exports = mongoose.model('Post', postScheema);