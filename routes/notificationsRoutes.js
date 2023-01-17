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
        pageTitle: 'Notifications',
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
    };

    return res.status(200).render('notificationsPage', payload);
});

module.exports = router;