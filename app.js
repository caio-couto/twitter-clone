const express = require('express');
const app = express();
const PORT = 5000;
const { requireLogin } = require('./middleware');
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/RegisterRoutes');
const logoutRoutes = require('./routes/logout');
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

app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/logout', logoutRoutes);

app.get('/', requireLogin, (req, res, next) =>
{
    const payload =
    {
        pageTitle: 'home',
        userLoggedIn: req.session.user
    } 
    
    res.status(200).render('home', payload);
});

const server = app.listen(PORT, () =>
{
    console.log(`Server listen on port ${PORT}`);
});