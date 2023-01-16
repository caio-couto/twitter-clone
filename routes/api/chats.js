const express =  require('express');
const router = express.Router();
const Post = require('../../schemas/Post');
const User = require('../../schemas/User');
const Chat = require('../../schemas/Chat');
const Message = require('../../schemas/Message');

router.get('/', async (req, res, next) =>
{
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } }})
    .populate('users')
    .populate('latestMessage')
    .sort({ updatedAt: -1})
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    chats = await User.populate(chats, { path: 'latestMessage.sender' })
    .catch((error) => 
    {
        console.log(error);
    });

    return res.status(200).send(chats);
});

router.get('/:chatId', async (req, res, next) =>
{
    const chats = await Chat.findOne({_id: req.params.chatId, users: { $elemMatch: { $eq: req.session.user._id } }})
    .populate('users')
    .sort({ updatedAt: -1})
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    return res.status(200).send(chats);
});

router.get('/:chatId/messages', async (req, res, next) =>
{
    const messages = await Message.find({chat: req.params.chatId})
    .populate('sender')
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    return res.status(200).send(messages);
});

router.post('/', async (req, res, next) =>
{
    if(!req.body.users)
    {
        console.log('users param not sent with request');
        return res.sendStatus(400);
    }

    const users = JSON.parse(req.body.users);

    if(users.length == 0)
    {
        console.log('users param not sent with request');
        return res.sendStatus(400);
    }

    users.push(req.session.user);

    const chatData = 
    {
        users: users,
        isGroupChat: true
    }

    const chat = await Chat.create(chatData)
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    return res.status(200).send(chat);
});

router.put('/:chatId', async (req, res, next) =>
{
    const chats = await Chat.findByIdAndUpdate(req.params.chatId, req.body)
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    return res.sendStatus(200);
});



module.exports = router;