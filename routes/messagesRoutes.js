const express = require('express');
const router = express.Router();
const Chat = require('../schemas/Chat');
const User = require('../schemas/User');
const mongoose = require('mongoose');

router.get('/', (req, res, next) =>
{
    const userLoggedIn = req.session.user;
    const payload = 
    {
        pageTitle: 'Inbox',
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
    };

    return res.status(200).render('inboxPage', payload);
});

router.get('/new', (req, res, next) =>
{
    const userLoggedIn = req.session.user;
    const payload = 
    {
        pageTitle: 'New message',
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
    };

    return res.status(200).render('newMessage', payload);
});

router.get('/:chatId', async (req, res, next) =>
{
    const userLoggedIn = req.session.user;
    const userId = userLoggedIn._id;
    const chatId = req.params.chatId;
    const isValidId = mongoose.isValidObjectId(chatId);

    if(!isValidId)
    {
        payload.errorMessage = 'Chat does not exist or not have permission to view it.'
        return res.sendStatus(400);
    }

    let chat = await Chat.findOne({_id: chatId, users: { $elemMatch: { $eq: userId } }}).populate('users')
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    const payload = 
    {
        pageTitle: 'Chat',
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
    };

    if(chat == null)
    {
        const userFound = await User.findById(chatId)
        .catch((error) =>
        {
            console.log(error);
            return res.sendStatus(400);
        });

        if(userFound != null)
        {
            chat = await getChatByUserId(userFound._id, userId);
            console.log(chat);
        }
    }

    if(chat == null)
    {
        payload.errorMessage = 'Chat does not exist or not have permission to view it.'
    }
    else
    {
        payload.chat = chat;
    }

    return res.status(200).render('chatPage', payload);
});

async function getChatByUserId(userLoggedIn, otherUserId)
{
    return await Chat.findOneAndUpdate(
    {
        isGroupChat: false,
        users:
        {
            $size: 2,
            $all:
            [
                { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedIn) }},
                { $elemMatch: { $eq:  mongoose.Types.ObjectId(otherUserId) }},
            ]
        }
    },
    {
        $setOnInsert:
        {
            users: [ userLoggedIn, otherUserId ]
        }
    },
    {
        new: true,
        upsert: true
    }).populate('users');
}

module.exports = router;