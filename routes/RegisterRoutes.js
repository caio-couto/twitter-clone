const router = require('express').Router();
const User = require('../schemas/User');
const bcrypt = require('bcrypt');

router.get('/', (req, res, next) =>
{
    return res.status(200).render('register');
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
            return res.status(200).render('register', payload);
        });

        if(user == null)
        {
            let newUser;
            try 
            {
                newUser = await User.create(
                {
                    firstName,
                    lastName,
                    username, 
                    email, 
                    password: await bcrypt.hash(password, 10)
                })    
            } 
            catch (error) 
            {
                payload.errorMessage = 'Something went wrong.';
                console.log(error);
                return res.status(200).render('register', payload);
            }
            
            req.session.user = newUser;
            return res.redirect('/');
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
            return res.status(200).render('register', payload);
        }
    }
    else
    {
        payload.errorMessage = 'Make sure each field has a valid value.';
        return res.status(200).render('register', payload);
    }
});


module.exports = router;