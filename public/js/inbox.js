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