const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const auth = require('../middleware/auth');

webpush.setVapidDetails(
    'mailto:test@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

let subscriptions = [];

// Subscribe
router.post('/subscribe', auth, (req, res) => {
    const subscription = req.body;
    const existing = subscriptions.find(s => s.endpoint === subscription.endpoint);
    if (!existing) {
        subscriptions.push(subscription);
    }
    res.status(201).json({ msg: 'Subscribed' });
});

// Send notification
router.post('/send', auth, (req, res) => {
    const { title, body } = req.body;
    const payload = JSON.stringify({ title, body });

    const notifications = subscriptions.map(sub =>
        webpush.sendNotification(sub, payload).catch(err => console.error(err))
    );

    Promise.all(notifications)
        .then(() => res.json({ msg: 'Notification sent' }))
        .catch(err => res.status(500).json({ msg: 'Failed to send' }));
});

module.exports = router;