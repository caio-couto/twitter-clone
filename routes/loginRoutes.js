const router = require('express').Router();
const User = require('../schemas/User');
const bcrypt = require('bcrypt');

router.get('/', (req, res, next) =>
{
    res.status(200).render('login');
});

router.post('/', async (req, res, next) =>
{
    const { logUsername, logPassword} = req.body;
    const payload = {};
    if(logUsername.trim() && logPassword)
    {
        const user = await User.findOne(
        {
            $or: 
            [
                {username: logUsername},
                {email: logUsername}
            ]
        })
        .catch((error) => 
        {
            console.log(error);
            payload.errorMessage = 'something went wrong.';
            res.status(200).render('login', payload);
        })

        if(user != null)
        {
            const result = await bcrypt.compare(req.body.logPassword, user.password);
            
            if(result === true)
            {
                req.session.user = user;
                res.redirect(req.session.returnTo || '/');
                delete req.session.returnTo;
            }
            else
            {
                payload.errorMessage = 'Login credentials incorrect.';
                res.status(200).render('login', payload);
            }
        }
        else
        {
            payload.errorMessage = 'Login credentials incorrect.';
            res.status(200).render('login', payload);
        }
    }
    else
    {
        payload.errorMessage = 'Make sure each field has a valid value.';
        res.status(200).render('login', payload);
    }
});


module.exports = router;