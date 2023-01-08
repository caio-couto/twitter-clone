$('#postTextarea, #replyTextarea').keyup((event) =>
{
    const textbox = $(event.target);
    const value = textbox.val().trim();
    const isModal = textbox.parents('.modal').length == 1;
    const submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton');

    if(submitButton.length == 0)
    {
        return;
    }
    if(value == '')
    {
        submitButton.prop('disabled', true);
        return;
    }
    submitButton.prop('disabled', false);
});

$('#submitPostButton, #submitReplyButton').click((event) =>
{
    const button = $(event.target);
    const isModal = button.parents('.modal').length == 1;
    const textbox = isModal ? $('#replyTextarea') : $('#postTextarea');
    const data = 
    {
        content: textbox.val()
    }

    if(isModal)
    {
        const id = button.data().id;

        if(id == null)
        {
            return;
        }

        data.replyTo = id;
    }

    $.post('/api/posts', data, (postData) =>
    {
        if(postData.replyTo)
        {
            location.reload();
        }
        else
        {
            const html = createPostHtml(postData);  
            $('.postsContainer').prepend(html);
            textbox.val('');
            button.prop('disabled', true);
        }
    });
});

$('#replyModal').on('show.bs.modal', (event) =>
{
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);

    $('#submitReplyButton').data('id', postId);
    
    $.get(`/api/posts/${postId}`, (results) =>
    {
        outputPosts(results.postData, $('#originalPostContainer'));
    });
});

$('#replyModal').on('hidden.bs.modal', () =>
{
    $('#originalPostContainer').html('');
});

$('#deleteModal').on('show.bs.modal', (event) =>
{
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);

    $('#deletePostButton').data('id', postId);
    
    $.get(`/api/posts/${postId}`, (results) =>
    {
        outputPosts(results.postData, $('#originalPostContainer'));
    });
});

$('#deleteModal').click((event) =>
{
    const postId = $(event.target).data('id');

    $.ajax(
    {
        url: `/api/posts/${postId}`,
        type: 'DELETE',
        success: (data, status, xhr) =>
        {
            if(xhr.status != 2002)
            {
               alert('cold not delete post');
               return;
            }
            
            location.reload();
        }
    });
});

$(document).on('click', '.likeButton', (event) =>
{
    const button = $(event.target);
    const postId = getPostIdFromElement(button);

    if(postId === undefined)
    {
        return;
    }

    $.ajax(
    {
        url: `/api/posts/${postId}/like`,
        type: 'PUT',
        success: (postData) =>
        {
            button.find('span').text(postData.likes.length || '');

            if(postData.likes.includes(userLoggendIn._id))
            {
                button.addClass('active');
            }
            else
            {
                button.removeClass('active');
            }
        }
    });
});

$(document).on('click', '.retweetButton', (event) =>
{
    const button = $(event.target);
    const postId = getPostIdFromElement(button);

    if(postId === undefined)
    {
        return;
    }

    $.ajax(
    {
        url: `/api/posts/${postId}/retweet`,
        type: 'PUT',
        success: (postData) =>
        {
            button.find('span').text(postData.retweetUsers.length || '');

            if(postData.retweetUsers.includes(userLoggendIn._id))
            {
                button.addClass('active');
            }
            else
            {
                button.removeClass('active');
            }
        }
    });
});

$(document).on('click', '.post', (event) =>
{
    const element = $(event.target);
    const postId = getPostIdFromElement(element);
    
    if(postId !== undefined && !element.is('button'))
    {
        window.location.href = `/posts/${postId}`;
    }
});

$(document).on('click', '.followButton', (event) =>
{
    const button = $(event.target);
    const userId = button.data().user;

    $.ajax(
        {
            url: `/api/users/${userId}/follow`,
            type: 'PUT',
            success: (data) =>
            {
                console.log(data);
            }
        });
    
});


function getPostIdFromElement(element)
{
    const isRoot = element.hasClass('post');
    const rootElement = isRoot ? element : element.closest('.post');
    const postId = rootElement.data().user;

    if(postId === undefined)
    {
        return 
    }

    return postId;
}

function createPostHtml(postData, largetFont = false)
{
    if(postData == null)
    {
        return;
    }

    const isRetweet = postData.retweetData !== undefined;
    const retweetedBy = isRetweet ? postData.postedBy.username : null;

    postData = isRetweet ? postData.retweetData : postData;

    const postedBy = postData.postedBy;
    const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
    const timestamps = timeDifference(new Date(), new Date(postData.createdAt));
    const likeButtonActiveClass = postData.likes.includes(userLoggendIn._id) ? 'active' : '';
    const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggendIn._id) ? 'active' : '';
    const largetFontClass = largetFont ? 'largerFont' : '';
    let retweetText = '';
    
    if(isRetweet)
    {
        retweetText = `<span>
                            <i class='fas fa-retweet'></i>
                            Retweeted by <a href='/profile/${retweetedBy}'>${retweetedBy}</a>
                        </span>`;
    }

    let replyFlag = '';
    if(postData.replyTo && postData.replyTo._id)
    {
        if(!postData.replyTo._id)
        {
            return alert('reply to is not populated');
        }
        else if(!postData.replyTo.postedBy._id)
        {
            return alert('postedBy is not populated');
        }
        const replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`;
    }
    
    let button = '';
    
    if(postData.postedBy._id == userLoggendIn._id)
    {
        button = `<button data-id='${postData._id}' data-bs-toggle="modal" data-bs-target="#deleteModal"><i class='fas fa-times'></i></button>`;
    }

    return `<div class='post ${largetFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamps}</span>
                            ${button}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-bs-toggle="modal" data-bs-target="#replyModal">
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                            <button class='retweetButton ${retweetButtonActiveClass}'>
                                <i class='fas fa-retweet'></i>
                                <span>${postData.retweetUsers.length || ''}</span>
                            </button>
                        </div>
                        <div class='postButtonContainer red'>
                            <button class='likeButton ${likeButtonActiveClass}'>
                                <i class='far fa-heart'></i>
                                <span>${postData.likes.length || ''}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) 
{

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) 
    {
        if(elapsed/1000 < 30)
        {
            return 'just now';
        }
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) 
    {
        return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) 
    {
        return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) 
    {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) 
    {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else 
    {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container)
{
    container.html('');

    if(!Array.isArray(results))
    {
        results = [results];
    }
    
    results.forEach((result) =>
    {
        const html = createPostHtml(result);
        container.append(html);
    });

    if(results.length == 0)
    {
        container.append('<span class="noResults">Nothing to show.</sapn>')
    }
}

function outputPostswhithReplies(results, container)
{
    container.html('');

    if(results.replyTo != undefined && results.replyTo._id !== undefined)
    {
        const html = createPostHtml(results.replyTo);
        container.append(html);
    }
    
    const mainPostHtml = createPostHtml(results.postData, true);
    container.append(mainPostHtml);

    results.replies.forEach((result) =>
    {
        const html = createPostHtml(result);
        container.append(html);
    });
}