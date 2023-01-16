var cropper = undefined;
var timer = undefined;
var selectedUsers = [];

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

$('#confirmPinModal').on('show.bs.modal', (event) =>
{
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);

    $('#pinPostButton').data('id', postId);
});

$('#pinPostButton').click((event) =>
{
    const postId = $(event.target).data('id');

    $.ajax(
    {
        url: `/api/posts/${postId}`,
        type: 'PUT',
        data: { pinned: true },
        success: (data, status, xhr) =>
        {
            if(xhr.status != 204)
            {
                alert('cold not pin post');
                 return;
            }
                
            location.reload();
        }
    });
});

$('#unpinModal').on('show.bs.modal', (event) =>
{
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);

    $('#unpinPostButton').data('id', postId);
});

$('#unpinPostButton').click((event) =>
{
    const postId = $(event.target).data('id');

    $.ajax(
    {
        url: `/api/posts/${postId}`,
        type: 'PUT',
        data: { pinned: false },
        success: (data, status, xhr) =>
        {
            if(xhr.status != 204)
            {
                alert('cold not pin post');
                 return;
            }
                
            location.reload();
        }
    });
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

    fetch(`/api/posts/${postId}`,
    {
        method: 'DELETE',
        headers:
        {
            'Content-Type': 'Application/json'
        }
    })
    .then(() =>
    {
        location.reload();
    })
});

$('#filePhoto').change((event) =>
{
    const input = event.target;

    if(input.files && input.files[0])
    {
        const reader = new FileReader();
        reader.onload = (event) =>
        {
            const image = document.getElementById('imagePreview');
            image.src = event.target.result;

            if(cropper !== undefined)
            {
                cropper.destroy();
            }

            cropper = new Cropper(image, 
            {
                aspectRatio: 1 / 1,
                background: false
            });
        }
        reader.readAsDataURL(input.files[0]);
    }
});

$('#coverPhoto').change((event) =>
{
    const input = event.target;

    if(input.files && input.files[0])
    {
        const reader = new FileReader();
        reader.onload = (event) =>
        {
            const image = document.getElementById('coverPreview');
            image.src = event.target.result;

            if(cropper !== undefined)
            {
                cropper.destroy();
            }

            cropper = new Cropper(image, 
            {
                aspectRatio: 16 / 9,
                background: false
            });
        }
        reader.readAsDataURL(input.files[0]);
    }
});

$('#imageUploadButton').click(() =>
{
    const canvas = cropper.getCroppedCanvas();

    if(canvas == null)
    {
        alert('Cold not upload image');
        return;
    }

    canvas.toBlob((blob) =>
    {
        const formData = new FormData();
        formData.append('croppedImage', blob);


        $.ajax(
        {
            url: '/api/users/profilePicture',
            type: 'POST', 
            data: formData,
            processData: false,
            contentType: false,
            success: () =>
            {
                location.reload();
            }
        })
    });
});

$('#coverPhotoButton').click(() =>
{
    const canvas = cropper.getCroppedCanvas();

    if(canvas == null)
    {
        alert('Cold not upload image');
        return;
    }

    canvas.toBlob((blob) =>
    {
        const formData = new FormData();
        formData.append('croppedImage', blob);


        $.ajax(
        {
            url: '/api/users/coverPhoto',
            type: 'POST', 
            data: formData,
            processData: false,
            contentType: false,
            success: () =>
            {
                location.reload();
            }
        })
    });
});

$('#userSearchTextBox').keydown((event) =>
{
    clearTimeout(timer);
    const textBox = $(event.target);
    let value = textBox.val();

    if(value == '' && (event.which == 8 || event.keyCode == 8))
    {
        selectedUsers.pop();
        updateSelectedUserHtml();
        $('.resultsContainer').html('');
        
        if(selectedUsers.length == 0)
        {
            $('#createChatButton').prop('disabled', true);
        }

        return;
    }

    timer = setTimeout(() => 
    {
        value = textBox.val().trim();

        if(value == '')
        {
            $('.resultsContainer').html('');
        }
        else
        {
            searchUsers(value);
        }
    }, 500);
});

$('#createChatButton').click(() =>
{
    const data = JSON.stringify(selectedUsers);

    $.post('/api/chats', { users: data }, (chat) =>
    {
        if(!chat || !chat._id)
        {
            return alert('invalid response from server.');
        }
        window.location.href = `/messages/${chat._id}`;
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

            if(postData.likes.includes(userLoggedIn._id))
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

            if(postData.retweetUsers.includes(userLoggedIn._id))
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
            success: (data, status, xhr) =>
            {
                if(xhr.status == 404)
                {
                    alert('user not founf');
                    return;
                }

                let difference = 1;
                if(data.following.includes(userId))
                {
                    button.addClass('following');
                    button.text('following')
                }
                else
                {
                    button.removeClass('following');
                    button.text('follow');
                    difference = -1;
                }
                
                const followersLabel = $('#followersValue');
                if(followersLabel.length != 0)
                {
                    const followersText = parseInt(followersLabel.text());
                    followersLabel.text(followersText + difference);
                }
            }
        });
    
});

function getPostIdFromElement(element)
{
    const isRoot = element.hasClass('post');
    const rootElement = isRoot ? element : element.closest('.post');
    const postId = rootElement.data().id;

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
    const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? 'active' : '';
    const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? 'active' : '';
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
    let pinnedPostText = '';
    
    if(postData.postedBy._id == userLoggedIn._id)
    {
        let pinnedClass = '';
        let dataTarget = '#confirmPinModal';

        if(postData.pinned && postData.pinned === true)
        {
            pinnedClass = 'active';
            dataTarget = '#unpinModal';
            pinnedPostText = '<i class="fas fa-thumbtack"></i> <span>Pinned post</span>';
        }

        button = 
        `<button class='pinButton ${pinnedClass}' data-id='${postData._id}' data-bs-toggle="modal" data-bs-target="${dataTarget}">
            <i class='fas fa-thumbtack'></i>
        </button>
        <button data-id='${postData._id}' data-bs-toggle="modal" data-bs-target="#deleteModal">
            <i class='fas fa-times'></i>
        </button>`;
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
                        <div class='pinnedPostText'>
                            ${pinnedPostText}
                        </div>
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

function outputUsers(results, container)
{
    container.html('');
    results.forEach((result) =>
    {
        const html = createUserHtml(result, true);
        container.append(html);
    });

    if(results.length == 0)
    {
        container.append('<span class="noResults">Results not found</span>');
    }
}

function createUserHtml(userData, showFollowButton)
{
    const name = `${userData.firstName} ${userData.lastName}`;
    const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    const text = isFollowing ? 'following' : 'follow';
    const buttonClass = isFollowing ? 'followButton following' : 'followButton';
    let followButton = '';

    if(showFollowButton && userLoggedIn._id != userData._id)
    {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}

function searchUsers(searchTerm)
{
    $.get('/api/users', { search: searchTerm }, (results) =>
    {
        outputSelectableUsers(results, $('.resultsContainer'));
    });
}

function outputSelectableUsers(results, container)
{
    container.html('');
    results.forEach((result) =>
    {
        if(result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id))
        {
            return;
        }

        const html = createUserHtml(result, false);
        const element = $(html);
        element.click(() => userSelected(results));
        container.append(element);
    });

    if(results.length == 0)
    {
        container.append('<span class="noResults">Results not found</span>');
    }
}

function userSelected(user)
{
    selectedUsers.push(user[0]);
    updateSelectedUserHtml();
    $('#userSearchTextBox').val('').focus();
    $('.resultsContainer').html('');
    $('#createChatButton').prop('disabled', false);
};

function updateSelectedUserHtml()
{
    const elements = [];

    selectedUsers.forEach((user) =>
    {
        const name = `${user.firstName} ${user.lastName}`; 
        const userElement = $(`<span class="selectedUser">${name}</span>`);
        elements.push(userElement);
    });

    $('.selectedUser').remove();
    $('#selectedUsers').prepend(elements);
}

function getChatName(chatData)
{
    let chatName = chatData.chatName;

    if(!chatName)
    {
        const otherCharUsers = getOtherChatUsers(chatData.users);
        const namesArray = otherCharUsers.map(user => `${user.firstName} ${user.lastName}`);
        chatName = namesArray.join(', ')
    }

    return chatName
}

function getOtherChatUsers(users)
{
    if(users.length == 1)
    {
        return users;
    }

    return users.filter((user) => user._id != userLoggedIn._id);
}

function messageRecived(newMessage)
{
    if($('.chatContainer').length == 0)
    {
        //show popup
    }
    else
    {
        addChatMessageHtml(newMessage);
    }
}