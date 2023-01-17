const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const { requireLogin } = require('./middleware');
const path = require('path');
const session = require('express-session');

const database = require('./database/connection');

const PORT = process.env.PORT || 3977;

const server = app.listen(PORT, () =>
{
    console.log(`Server listen on port ${process.env.PORT}`);
});

const io = require('socket.io')(server, { pingTimeout: 60000 });

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session(
{
    secret: 'caio couto',
    resave: true,
    saveUninitialized: false
}));

const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');
const postRoute = require('./routes//postRoutes');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messagesRoute = require('./routes/messagesRoutes');
const notificationsRoute = require('./routes/notificationsRoutes');

const usersApiRoute = require('./routes/api/user');
const postsApiRoute = require('./routes/api/posts');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages');
const notificationsApiRoute = require('./routes/api/notifications');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/logout', logoutRoute);
app.use('/posts', requireLogin, postRoute);
app.use('/profile', requireLogin, profileRoute);
app.use('/uploads', uploadRoute);
app.use('/search', requireLogin, searchRoute);
app.use('/messages', requireLogin, messagesRoute);
app.use('/notifications', requireLogin, notificationsRoute);

app.use('/api/posts', postsApiRoute);
app.use('/api/users', usersApiRoute);
app.use('/api/chats', chatsApiRoute);
app.use('/api/messages', messagesApiRoute);
app.use('/api/messages', messagesApiRoute);
app.use('/api/notifications', notificationsApiRoute);

app.get('/', requireLogin, (req, res, next) =>
{
    const payload =
    {
        pageTitle: 'home',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    } 
    
    res.status(200).render('home', payload);
});

io.on('connection', (socket) =>
{
    socket.on('setup', (userData) =>
    {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join room', (chatId) =>
    {
        socket.join(chatId);
    });

    socket.on('typing', (chatId) =>
    {
        socket.in(chatId).emit('typing');
    });

    socket.on('stop typing', (chatId) =>
    {
        socket.in(chatId).emit('stop typing');
    });

    socket.on('notifications recived', (chatId) =>
    {
        console.log(chatId);
        socket.in(chatId).emit('notifications recived');
    });

    socket.on('new message', (newMessage) =>
    {
        const chat = newMessage.chat;

        if(!chat.users)
        {
            return console.log('Chat.users not defined');
        }

        chat.users.forEach((user) =>
        {
           if(user._id == newMessage.sender._id)
            {
                return;
            }
            socket.in(user._id).emit('message recived', newMessage);
        });
    });
});