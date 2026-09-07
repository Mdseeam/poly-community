const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const auth = require('../middleware/auth');

// Get all notices for community
router.get('/community/:communityId', async (req, res) => {
    try {
        const { search, tag } = req.query;
        let query = { communityId: req.params.communityId };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        if (tag) {
            query.tags = tag;
        }

        const notices = await Notice.find(query)
            .sort({ isPinned: -1, createdAt: -1 })
            .populate('author', 'name')
            .populate('comments.user', 'name');
        res.json(notices);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Create notice
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, communityId, tags } = req.body;
        const notice = new Notice({ title, content, communityId, author: req.user.id, tags });
        await notice.save();
        res.json(notice);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Like/Unlike notice
router.put('/:id/like', auth, async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ msg: 'Notice not found' });

        const likeIndex = notice.likes.indexOf(req.user.id);
        if (likeIndex > -1) {
            notice.likes.splice(likeIndex, 1);
        } else {
            notice.likes.push(req.user.id);
        }
        await notice.save();
        res.json(notice);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ msg: 'Notice not found' });

        notice.comments.push({ user: req.user.id, text: req.body.text });
        await notice.save();
        const populated = await notice.populate('comments.user', 'name');
        res.json(populated);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Delete notice
router.delete('/:id', auth, async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ msg: 'Notice not found' });

        if (notice.author.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await notice.remove();
        res.json({ msg: 'Notice removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;