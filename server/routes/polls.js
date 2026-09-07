const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 }).populate('createdBy', 'name');
        res.json(polls);
    } catch (err) { res.status(500).send('Server error'); }
});

router.post('/', auth, async (req, res) => {
    try {
        const { question, options } = req.body;
        const poll = new Poll({
            question,
            options: options.map(text => ({ text, votes: [] })),
            createdBy: req.user.id
        });
        await poll.save();
        res.json(poll);
    } catch (err) { res.status(500).send('Server error'); }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ msg: 'Poll not found' });
        if (poll.createdBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
        const { question, options } = req.body;
        if (question) poll.question = question;
        if (options) {
            poll.options = options.map(text => ({
                text,
                votes: poll.options.find(opt => opt.text === text)?.votes || []
            }));
        }
        await poll.save();
        res.json(poll);
    } catch (err) { res.status(500).send('Server error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ msg: 'Poll not found' });
        if (poll.createdBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
        await poll.deleteOne();
        res.json({ msg: 'Poll deleted' });
    } catch (err) { res.status(500).send('Server error'); }
});

router.put('/:id/vote/:optionIndex', auth, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ msg: 'Poll not found' });
        const idx = req.params.optionIndex;
        if (idx >= poll.options.length) return res.status(400).json({ msg: 'Invalid option' });

        poll.options.forEach(opt => {
            const userVoteIndex = opt.votes.indexOf(req.user.id);
            if (userVoteIndex > -1) opt.votes.splice(userVoteIndex, 1);
        });

        poll.options[idx].votes.push(req.user.id);
        await poll.save();
        const populated = await poll.populate('createdBy', 'name');
        res.json(populated);
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;