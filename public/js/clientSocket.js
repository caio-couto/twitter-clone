let connected = false;

const socket = io('http://localhost:5000');

socket.emit('setup', userLoggedIn);

socket.on('connected', () =>
{
    connected = true;
});

socket.on('message recived', (newMessage) =>
{
    messageRecived(newMessage);
});

socket.on('notifications recived', () =>
{
    $.get('/api/notifications/latest', (notificationData) =>
    {
        showNotificationPopup(notificationData)
        refreshNotificationsBadge();
    })
});

function emitNotification(userId)
{
    if(userId == userLoggedIn._id)
    {
        return;
    }

    socket.emit('notifications recived', userId);
}
