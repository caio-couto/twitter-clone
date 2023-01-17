const mongoose = require('mongoose');

const notificationScheema = new mongoose.Schema(
{
    userTo:
    {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    userFrom:
    {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    notificationType:
    {
        type: String
    },
    opened:
    {
        type: Boolean,
        default: false
    },
    entityId:
    {
        type: mongoose.Types.ObjectId
    }
}, 
{
    timestamps: true
});

notificationScheema.static('insertNotification', async function(userTo, userFrom, notificationType, entityId) 
{ 
    const data = 
    {
        userTo,
        userFrom,
        notificationType,
        entityId
    }

    await this.deleteOne(data).catch((error) =>
    {
        console.log(error);
    });
    return this.create(data).catch((error) =>
    {
        console.log(error);
    });;
});

module.exports = mongoose.model('Notification', notificationScheema);