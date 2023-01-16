$(document).ready(() =>
{
    $.get('/api/chats', (data, status, xhr) =>
    {
        if(xhr.status == 400)
        {
            alert('Cold not get chat list.');
        }
        else
        {
            outputChatList(data, $('.resultsContainer'));
        }
    });
});

function outputChatList(chatList, container)
{
    chatList.forEach((chat) =>
    {
        const html = createChatHtml(chat);
        container.append(html);
    });

    if(chatList.length == 0)
    {
        container.append('<span class="noResults">Results not found</span>');
    }
}

function createChatHtml(chatData)
{
    const chatName = getChatName(chatData);
    const image = getChatImageElements(chatData);
    const latestMessage = getLatestMessage(chatData.latestMessage[0]);


    return `<a href='/messages/${chatData._id}' class='resultListItem'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading'>${chatName}</span>
                    <span class='subText'>${latestMessage}</span>
                </div>
            </a>`;
}

function getLatestMessage(latestMessage)
{
    if(latestMessage != null)
    {
        const sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
    }

    return 'New chat';
}

function getChatImageElements(chatData)
{
    const otherCharUsers = getOtherChatUsers(chatData.users);
    let groupChatClass = '';
    let chatImage = getUserChatImageElement(otherCharUsers[0]);

    if(otherCharUsers.length > 1)
    {
        groupChatClass = 'groupChatImage';
        chatImage += getUserChatImageElement(otherCharUsers[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>
                ${chatImage}
            </div>`
}

function getUserChatImageElement(user)
{
    if(!user || !user.profilePic)
    {
        return alert('User passed into function is invalid');
    }

    return `<img src='${user.profilePic}' alt='Users profile pic'>`
}