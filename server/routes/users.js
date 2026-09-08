const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// সব ইউজার (নাম, ডিপার্টমেন্ট, প্রোফাইল পিক)
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('name department semester profilePic bio')
            .sort({ name: 1 });
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// সার্চ
router.get('/search', async (req, res) => {
    const q = req.query.q || '';
    try {
        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { department: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('name department semester profilePic bio');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// নির্দিষ্ট ইউজার প্রোফাইল
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('polytechnicId', 'name shortName');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;