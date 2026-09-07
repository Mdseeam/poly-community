const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 }).populate('createdBy', 'name');
        res.json(events);
    } catch (err) { res.status(500).send('Server error'); }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        const { title, description, date, communityId, videoUrl } = req.body;
        const event = new Event({
            title,
            description,
            date,
            communityId,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
            videoUrl,
            createdBy: req.user.id
        });
        await event.save();
        res.json(event);
    } catch (err) { res.status(500).send('Server error'); }
});

router.put('/:id', auth, upload.single('file'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        if (event.createdBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

        const { title, description, date, videoUrl } = req.body;
        if (title) event.title = title;
        if (description) event.description = description;
        if (date) event.date = date;
        if (videoUrl) event.videoUrl = videoUrl;
        if (req.file) event.imageUrl = `/uploads/${req.file.filename}`;
        await event.save();
        res.json(event);
    } catch (err) { res.status(500).send('Server error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        if (event.createdBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
        await event.deleteOne();
        res.json({ msg: 'Event deleted' });
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;