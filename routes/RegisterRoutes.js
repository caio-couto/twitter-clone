const router = require('express').Router();
const User = require('../schemas/User');
const bcrypt = require('bcrypt');

router.get('/', (req, res, next) =>
{
    res.status(200).render('register');
});

router.post('/', async (req, res, next) =>
{
    const { firstName, lastName , username, email, password} = req.body;
    const payload = req.body;

    if(firstName.trim() && lastName.trim() && username.trim() && email.trim() && password)
    {
        const user = await User.findOne(
        {  
            $or: 
            [
                {username},
                {email}
            ]
        })
        .catch((error) =>
        {
            console.log(error);
            payload.errorMessage = 'Something went wrong.';
            res.status(200).render('register', payload);
        });

        if(user == null)
        {
            const newUser = await User.create(
            {
                firstName,
                lastName,
                username, 
                email, 
                password: await bcrypt.hash(password, 10)
            })
            .catch((error) => 
            {
                payload.errorMessage = 'Something went wrong.';
                res.status(200).render('register', payload);
            });

            req.session.user = newUser;
            res.redirect('/');
        }
        else
        {
            if(email == user.email)
            {
                payload.errorMessage = 'Email already in use.';
            }
            else
            {
                payload.errorMessage = 'Email already in use.';
            }
            res.status(200).render('register', payload);
        }
    }
    else
    {
        payload.errorMessage = 'Make sure each field has a valid value.';
        res.status(200).render('register', payload);
    }
});


module.exports = router;