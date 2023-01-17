var typing = false;
var lastTypingTime = undefined;

$(document).ready(() =>
{
    socket.emit('join room', chatId);
    socket.on('typing', () =>
    {   
        $('.typingDots').show();
        scrollToBottom(true)
    });

    socket.on('stop typing', () =>
    {   
        $('.typingDots').hide();
        scrollToBottom(true)
    });

    $.get(`/api/chats/${chatId}`, (data) =>
    {
        $('#chatName').text(getChatName(data));
    });
    $.get(`/api/chats/${chatId}/messages`, (data) =>
    {
        const messages = [];
        let lastSenderId = '';

        data.forEach((message, index) =>
        {
            const html = creteMessageHtml(message, data[index + 1], lastSenderId);
            messages.push(html);
            
            lastSenderId = message.sender._id;
        });

        const messagesHtml = messages.join('');
        addMessagesHtmlToPage(messagesHtml);
        scrollToBottom(false);
        markAllMessagesRead();

        $('.loadingSpinnerContainer').remove();
        $('.chatContainer').css('visibility', 'visible');
    });
});

$('#chatNameButton').click((event) =>
{
    const name = $('#chatNameTextBox').val().trim();

    $.ajax(
    {
        url: `/api/chats/${chatId}`,
        type: 'PUT',
        data: { chatName: name },
        success: (data, status, xhr) =>
        {
            if(xhr.status != 200)
            {
                alert('cold not update');
            }
            else
            {
                location.reload();
            }
        }
    })
});

$('.sendMessageButton').click(() =>
{
    messageSubmitted();
});

$('.inputTextBox').keydown((event) =>
{
    updateTyping();

    if(event.which === 13 && !event.shiftKey)
    {
        messageSubmitted();
        return false;
    }
});

function updateTyping()
{
    if(!connected)
    {
        return false;
    }
    if(!typing)
    {
        typing = true;
        socket.emit('typing', chatId);
    }

    lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() =>
    {
        const timeNow = new Date().getTime();
        const timeDiff = timeNow - lastTypingTime;

        if(timeDiff >= timerLength && typing)
        {
            socket.emit('stop typing', chatId);
            typing = false;
        }
    }, timerLength);
}

function addMessagesHtmlToPage(html)
{
    $('.chatMessages').append(html);
}

function messageSubmitted()
{   
    const content = $('.inputTextBox').val().trim();

    if(content != '')
    {
        $('.inputTextBox').val('');
        sendMessage(content);
        socket.emit('stop typing', chatId);
        typing = false;
    }
}

function sendMessage(content)
{
    $.post('/api/messages/', { content: content, chatId: chatId }, (data, status, xhr) =>
    {
        if(xhr.status != 201)
        {
            alert('Cold not send message');
            $('.inputTextBox').val(content);
        }
        addChatMessageHtml(data);
        if(connected)
        {
            socket.emit('new message', data);
        }
    });
}

function addChatMessageHtml(message)
{
    if(!message || !message._id)
    {
        alert('Message is not valid');
        return;
    }

    const messageDiv = creteMessageHtml(message);
    addMessagesHtmlToPage(messageDiv);
    scrollToBottom(true);
}

function creteMessageHtml(message, nexMessage = null,  lastSenderId = '')
{
    const sender = message.sender;
    const senderName = `${sender.firstName} ${sender.lastName}`;

    const currentSenderId = sender._id;
    const nextSenderId = nexMessage != null ? nexMessage.sender._id : '';

    const isFirst = lastSenderId != currentSenderId;
    const isLast = nextSenderId != currentSenderId;

    const isMine = message.sender._id == userLoggedIn._id;
    let liClassName = isMine ? 'mine' : 'theirs';

    let nameElement = '';

    if(isFirst)
    {
        liClassName += ' first';

        if(!isMine)
        {
            nameElement = `<span class='senderName'>${senderName}</span>`;
        }
    }

    let profileImage = '';
    if(isLast)
    {
        liClassName += ' last';
        profileImage = `<img src='${sender.profilePic}'>`;
    }

    let imageContainer = '';
    if(!isMine)
    {
        imageContainer = 
        `<div class='imageContainer'>
            ${profileImage}
        </div>`
    }

    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated)
{
    const container = $('.chatMessages');
    const scrollHeight = container[0].scrollHeight;

    if(animated)
    {
        container.animate({ scrollTop: scrollHeight }, 'slow');
    }
    else
    {
        container.scrollTop(scrollHeight);
    }
}

function markAllMessagesRead()
{
    $.ajax(
    {
        url: `/api/chats/${chatId}/messages/markRead`,
        type: 'PUT',
        success: () =>
        {
            refreshMessagesBadge();
        }
    });
}

