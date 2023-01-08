const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const { requireLogin } = require('./middleware');
const path = require('path');
const session = require('express-session');

const database = require('./database/connection');

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
const usersRoute = require('./routes/profileRoutes');

const postsApiRoute = require('./routes/api/posts');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/logout', logoutRoute);
app.use('/posts', requireLogin, postRoute);
app.use('/profile', requireLogin, profileRoute);

app.use('/api/posts', postsApiRoute);

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

const server = app.listen(process.env.PORT, () =>
{
    console.log(`Server listen on port ${process.env.PORT}`);
});