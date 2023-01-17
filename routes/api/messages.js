const express =  require('express');
const router = express.Router();
const Post = require('../../schemas/Post');
const User = require('../../schemas/User');
const Chat = require('../../schemas/Chat');
const Message = require('../../schemas/Message');
const Notification = require('../../schemas/Notification');

router.post('/', async (req, res, next) =>
{
    if(!req.body.content || !req.body.chatId)
    {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    const newMessage = 
    {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    };

    let message = await Message.create(newMessage)
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400)
    });

    const chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
    .catch((error) =>
    {
        console.log(error);
    });

    message = await message.populate(['sender'])
    .catch((error) =>
    {
        console.log(error);
    });
    message = await message.populate(['chat'])
    .catch((error) =>
    {
        console.log(error);
    });
    message = await User.populate(message, { path: 'chat.users' })
    .catch((error) =>
    {
        console.log(error);
    });

    insertNotifications(chat, message);

    res.status(201).send(message);
});

function insertNotifications(chat, message)
{
    chat.users.forEach((userId) =>
    {
        console.log(message.sender._id, userId);
        if(userId.toString() == message.sender._id.toString())
        {
            return;
        }

        Notification.insertNotification(userId, message.sender._id, 'newMessage', message.chat._id);
    });
}

module.exports = router;