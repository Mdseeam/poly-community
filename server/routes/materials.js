const express = require('express');
const router = express.Router();
const StudyMaterial = require('../models/StudyMaterial');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
        const { department, semester, subject } = req.query;
        let query = {};
        if (department) query.department = department;
        if (semester) query.semester = semester;
        if (subject) query.subject = subject;
        const materials = await StudyMaterial.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'name');
        res.json(materials);
    } catch (err) { res.status(500).send('Server error'); }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        const { title, description, subject, department, semester, fileUrl } = req.body;
        const material = new StudyMaterial({
            title,
            description,
            subject,
            department,
            semester,
            fileUrl,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
            uploadedBy: req.user.id
        });
        await material.save();
        res.json(material);
    } catch (err) { res.status(500).send('Server error'); }
});

router.put('/:id', auth, upload.single('file'), async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ msg: 'Material not found' });
        if (material.uploadedBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

        const { title, description, subject, department, semester, fileUrl } = req.body;
        if (title) material.title = title;
        if (description) material.description = description;
        if (subject) material.subject = subject;
        if (department) material.department = department;
        if (semester) material.semester = semester;
        if (fileUrl) material.fileUrl = fileUrl;
        if (req.file) material.imageUrl = `/uploads/${req.file.filename}`;
        await material.save();
        res.json(material);
    } catch (err) { res.status(500).send('Server error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ msg: 'Material not found' });
        if (material.uploadedBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
        await material.deleteOne();
        res.json({ msg: 'Material deleted' });
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;