const express =  require('express');
const router = express.Router();
const Notification = require('../../schemas/Notification');

router.get('/', async (req, res, next) =>
{
    const searchObj = { userTo: req.session.user._id, notificationType: { $ne: 'newMessage'} };

    if(req.query.unreadOnly !== undefined && req.query.unreadOnly == 'true')
    {
        searchObj.opened = false;
    }

    const notifications = await Notification.find(searchObj)
    .populate('userTo')
    .populate('userFrom')
    .sort({ createdAt: -1 })
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    res.status(200).send(notifications);
});

router.get('/latest', async (req, res, next) =>
{
    const notifications = await Notification.findOne({ userTo: req.session.user._id})
    .populate('userTo')
    .populate('userFrom')
    .sort({ createdAt: -1 })
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    res.status(200).send(notifications);
});

router.put('/:id/markAsOpened', async (req, res, next) =>
{
    const notification = await Notification.findByIdAndUpdate(req.params.id, { opened: true })
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    res.status(200).send(notification);
});

router.put('/markAsOpened', async (req, res, next) =>
{
    const notification = await Notification.updateMany({ userTo: req.session.user._id } ,{ opened: true })
    .catch((error) =>
    {
        console.log(error);
        return res.sendStatus(400);
    });

    res.status(200).send(notification);
});



module.exports = router;