const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) =>
{
    const payload = createPayload(req.session.user);

    return res.status(200).render('searchPage', payload);
});

router.get('/:selectedTab', (req, res, next) =>
{
    const payload = createPayload(req.session.user);
    payload.selectedTab = req.params.selectedTab;

    return res.status(200).render('searchPage', payload);
});

function createPayload(userLoggedIn)
{
    return {
        pageTitle: 'Search',
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
    }
}

module.exports = router;