const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const PrivateMessage = require('../models/PrivateMessage');

// গ্লোবাল মেসেজ
router.get('/global', auth, async (req, res) => {
    try {
        const messages = await Message.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('sender', 'name profilePic');
        res.json(messages.reverse());
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// প্রাইভেট মেসেজ থ্রেড
router.get('/private/:userId', auth, async (req, res) => {
    try {
        const messages = await PrivateMessage.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 }).populate('sender', 'name profilePic');
        res.json(messages);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// ইনবক্স
router.get('/inbox', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const allMessages = await PrivateMessage.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 }).populate('sender', 'name profilePic').populate('receiver', 'name profilePic');

        const conversationMap = new Map();
        allMessages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
            const otherId = otherUser._id.toString();
            if (!conversationMap.has(otherId)) {
                conversationMap.set(otherId, {
                    user: { _id: otherUser._id, name: otherUser.name, profilePic: otherUser.profilePic },
                    lastMessage: msg.content,
                    updatedAt: msg.createdAt
                });
            }
        });
        const conversations = Array.from(conversationMap.values());
        conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        res.json(conversations);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// প্রাইভেট মেসেজ পাঠানো
router.post('/private', auth, async (req, res) => {
    try {
        const { receiver, content } = req.body;
        const msg = new PrivateMessage({ sender: req.user.id, receiver, content });
        await msg.save();
        const populated = await msg.populate('sender', 'name profilePic');
        res.json(populated);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// গ্লোবাল মেসেজ এডিট
router.put('/global/:id', auth, async (req, res) => {
    try {
        const msg = await Message.findById(req.params.id);
        if (!msg) return res.status(404).json({ msg: 'Message not found' });
        if (msg.sender.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        msg.content = req.body.content;
        msg.isEdited = true;
        await msg.save();
        res.json(msg);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// গ্লোবাল মেসেজ ডিলিট (soft delete)
router.delete('/global/:id', auth, async (req, res) => {
    try {
        const msg = await Message.findById(req.params.id);
        if (!msg) return res.status(404).json({ msg: 'Message not found' });
        if (msg.sender.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        msg.isDeleted = true;
        await msg.save();
        res.json({ msg: 'Message deleted' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// প্রাইভেট মেসেজ এডিট
router.put('/private/:id', auth, async (req, res) => {
    try {
        const msg = await PrivateMessage.findById(req.params.id);
        if (!msg) return res.status(404).json({ msg: 'Message not found' });
        if (msg.sender.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        msg.content = req.body.content;
        msg.isEdited = true;
        await msg.save();
        res.json(msg);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// প্রাইভেট মেসেজ ডিলিট (soft delete)
router.delete('/private/:id', auth, async (req, res) => {
    try {
        const msg = await PrivateMessage.findById(req.params.id);
        if (!msg) return res.status(404).json({ msg: 'Message not found' });
        if (msg.sender.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        msg.isDeleted = true;
        await msg.save();
        res.json({ msg: 'Message deleted' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;