const express = require('express');
const User = require('../../schemas/User');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const path = require('path');
const fs = require('fs');
const Notification = require('../../schemas/Notification');

router.get('/', async (req, res, next) =>
{
    let searchObj = req.query;

    if(req.query.search !== undefined)
    {
        searchObj = 
        {
            $or:
            [
                { firstName: { $regex: searchObj.search, $options: 'i'}},
                { lastName: { $regex: searchObj.search, $options: 'i'}},
                { username: { $regex: searchObj.search, $options: 'i'}}
            ]
        }

        const search = await User.find(searchObj)
        .catch((error) =>
        {
            console.log(error);
            return res.sendStatus(400);
        });

        return res.status(200).send(search);
    }
});

router.put('/:userId/follow', async (req, res, next) =>
{
    const userId = req.params.userId;

    const user = await User.findById(userId)
    .catch((error) =>
    {
        console.log(error);
    }); 

    if(user == null)
    {
        return res.sendStatus(404);
    }

    const isFollowing = user.followers && user.followers.includes(req.session.user._id);
    const option = isFollowing ? '$pull' : '$addToSet';

    const updatedUser = await User.findByIdAndUpdate(req.session.user._id, {[option]: {following: userId}}, { new: true})
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });
    
    req.session.user = updatedUser;

    await User.findByIdAndUpdate(userId, {[option]: {followers: req.session.user._id}})
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });

    if(!isFollowing)
    {
        await Notification.insertNotification(userId, req.session.user._id, 'follow', req.session.user._id);
    }

    return res.status(200).send(req.session.user);
});

router.get('/:userId/following', async (req, res, next) =>
{
    const user = await User.findById(req.params.userId).populate('following')
    .catch((error) =>
    {
        console.log(error);
    });

    return res.status(200).send(user);
});

router.get('/:userId/followers', async (req, res, next) =>
{
    const user = await User.findById(req.params.userId).populate('followers')
    .catch((error) =>
    {
        console.log(error);
    });

   return res.status(200).send(user);
});

router.post('/profilePicture', upload.single('croppedImage'), async (req, res, next) => 
{
    if(!req.file)
    {
        console.log('no file uploaded.');
        return res.sendStatus(400);
    }

    if(req.session.user.profilePic !== '/images/profilePic.jpeg')
    {
        const filePath = req.session.user.profilePic;
        const targetPath = path.join(__dirname, `../../${filePath}`);
        await fs.unlink(targetPath, (error) =>
        {
            if(error != null)
            {
                console.log(error);
                return res.sendStatus(400);
            }
        });
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);

    await fs.rename(tempPath, targetPath, async (error) =>
    {
        if(error != null)
        {
            console.log(error);
            return res.sendStatus(400);
        }

        const user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath }, { new: true })
        .catch((error) =>
        {
            console.log(error);
            return res.sendStatus(400);
        });

        req.session.user = user;

        return res.sendStatus(204);
    });
});

router.post('/coverPhoto', upload.single('croppedImage'), async (req, res, next) => 
{
    if(!req.file)
    {
        console.log('no file uploaded.');
        return res.sendStatus(400);
    }

    if(req.session.user.coverPhoto !== 'none')
    {
        const filePath = req.session.user.coverPhoto;
        const targetPath = path.join(__dirname, `../../${filePath}`);
        await fs.unlink(targetPath, (error) =>
        {
            if(error != null)
            {
                console.log(error);
                return res.sendStatus(400);
            }
        });
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);

    await fs.rename(tempPath, targetPath, async (error) =>
    {
        if(error != null)
        {
            console.log(error);
            return res.sendStatus(400);
        }

        const user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true })
        .catch((error) =>
        {
            console.log(error);
            return res.sendStatus(400);
        });

        req.session.user = user;

        return res.sendStatus(204);
    });
});

module.exports = router;