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
