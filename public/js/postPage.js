$(document).ready(() =>
{
    $.get(`/api/posts/${postId}`, (results) =>
    {
        outputPostswhithReplies(results, $('.postsContainer'));
    });
});