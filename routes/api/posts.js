const express =  require('express');
const router = express.Router();
const Post = require('../../schemas/Post');
const User = require('../../schemas/User');

router.get('/', async (req, res, next) =>
{
    const searchObj = req.query;
    
    if(searchObj.isReply !== undefined)
    {
        const isReply = searchObj.isReply == 'true';
        searchObj.replyTo = {$exists: isReply};
        delete searchObj.isReply;
    }

    const results = await getPosts(searchObj);
    res.status(200).send(results)
});

router.get('/:id', async (req, res, next) =>
{
    const postId = req.params.id;
    let postData = await getPosts({_id: postId});
    postData = postData[0];

    let results = 
    {
        postData: postData,
    }
    if(postData.replyTo != undefined)
    {
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({replyTo: postId})
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });

    res.status(200).send(results);
});


router.post('/', async (req, res, next) =>
{
    const content = req.body.content;
    const postData = 
    {
        content: content,
        postedBy: req.session.user
    }

    if(req.body.replyTo)
    {
        postData.replyTo = req.body.replyTo;
    }

    if(!content)
    {
        console.log('content param not sent with request');
        return req.status(400);
    }

    if(!req.session.user)
    {
        console.log('user not logged in');
        return req.status(400);
    }

    const newPost = await (await Post.create(postData)).populate('postedBy')
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });

    res.status(201).send(newPost);
});

router.put('/:id/like', async (req, res, next) =>
{
    const postId = req.params.id;
    const userId = req.session.user._id;
    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
    const option = isLiked ? "$pull" : "$addToSet";

    const user = await User.findByIdAndUpdate(userId, {[option]: {likes: postId}}, {new: true})
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });

    const post = await Post.findByIdAndUpdate(postId, {[option]: {likes: userId}}, {new: true})
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });

    req.session.user = user;

    res.status(200).send(post);
});

router.put('/:id/retweet', async (req, res, next) =>
{
    const postId = req.params.id;
    const userId = req.session.user._id;

    const deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId})
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });

    const option = deletedPost != null ? "$pull" : "$addToSet";

    let repost = deletedPost;

    if(repost == null)
    {
        repost = await Post.create({postedBy: userId, retweetData: postId})
        .catch((error) =>
        {
            console.log(error);
            res.sendStatus(400);
        });
    }
    
    const user = await User.findByIdAndUpdate(userId, {[option]: {retweets: repost._id}}, {new: true})
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });

    const post = await Post.findByIdAndUpdate(postId, {[option]: {retweetUsers: userId}}, {new: true})
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });

    req.session.user = user;

    res.status(200).send(post);
});

router.delete('/', async (req, res, next) =>
{
    const id = req.params.id;

    const deletedPost = await Post.findByIdAndDelete(id)
    .catch((error) =>
    {
        console.log(error);
        res.sendStatus(400);
    });

    res.status(202);
});

async function getPosts(filter)
{
    let posts = await Post.find(filter).populate('postedBy').populate('retweetData').populate('replyTo').sort({'createdAt': -1})
    .catch((error) =>
    {
        console.log(error);
        res.status(400);
    });
    posts = await User.populate(posts, {path: 'replyTo.postedBy'});
    posts = await User.populate(posts, {path: 'retweetData.postedBy'});
    return posts;
}

module.exports = router;