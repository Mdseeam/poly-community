const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        res.json(jobs);
    } catch (err) { res.status(500).send('Server error'); }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        const { title, company, location, description, type } = req.body;
        const job = new Job({
            title,
            company,
            location,
            description,
            type,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
            postedBy: req.user.id
        });
        await job.save();
        res.json(job);
    } catch (err) { res.status(500).send('Server error'); }
});

router.put('/:id', auth, upload.single('file'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });
        if (job.postedBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

        const { title, company, location, description, type } = req.body;
        if (title) job.title = title;
        if (company) job.company = company;
        if (location) job.location = location;
        if (description) job.description = description;
        if (type) job.type = type;
        if (req.file) job.imageUrl = `/uploads/${req.file.filename}`;
        await job.save();
        res.json(job);
    } catch (err) { res.status(500).send('Server error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });
        if (job.postedBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
        await job.deleteOne();
        res.json({ msg: 'Job deleted' });
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;