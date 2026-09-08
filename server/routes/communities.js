const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Community = require('../models/Community');
const auth = require('../middleware/auth');
const User = require('../models/User');

// সব কমিউনিটি (পাসওয়ার্ড ছাড়া)
router.get('/', async (req, res) => {
    try {
        const communities = await Community.find()
            .select('-password')
            .populate('creator', 'name')
            .populate('members', 'name')
            .sort({ createdAt: -1 });
        res.json(communities);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// নতুন কমিউনিটি তৈরি
router.post('/', auth, async (req, res) => {
    const { name, description, isPrivate, password, polytechnicId } = req.body;
    try {
        let community = new Community({
            name,
            description,
            creator: req.user.id,
            isPrivate,
            password: '',
            polytechnicId,
            members: [req.user.id],
            moderators: [req.user.id]
        });

        if (isPrivate && password) {
            const salt = await bcrypt.genSalt(10);
            community.password = await bcrypt.hash(password, salt);
        }

        await community.save();
        res.json(community);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// কমিউনিটিতে যোগ দিন (পাসওয়ার্ড চেক সহ)
router.post('/:id/join', auth, async (req, res) => {
    const { password } = req.body;
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ msg: 'Community not found' });

        // ইতিমধ্যে মেম্বার হলে
        if (community.members.includes(req.user.id)) {
            return res.json(community);
        }

        // প্রাইভেট হলে পাসওয়ার্ড চেক
        if (community.isPrivate) {
            if (!password) return res.status(400).json({ msg: 'Password required' });
            const isMatch = await bcrypt.compare(password, community.password);
            if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });
        }

        community.members.push(req.user.id);
        await community.save();
        const populated = await community.populate('members', 'name');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// নির্দিষ্ট কমিউনিটি (পাসওয়ার্ড ছাড়া)
router.get('/:id', async (req, res) => {
    try {
        const community = await Community.findById(req.params.id)
            .select('-password')
            .populate('creator', 'name')
            .populate('members', 'name')
            .populate('polytechnicId', 'name shortName');
        if (!community) return res.status(404).json({ msg: 'Community not found' });
        res.json(community);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;