const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 }).populate('author', 'name');
        res.json(articles);
    } catch (err) { res.status(500).send('Server error'); }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        const { title, content, videoUrl, tags } = req.body;
        const article = new Article({
            title,
            content,
            coverImage: req.file ? `/uploads/${req.file.filename}` : null,
            videoUrl,
            tags,
            author: req.user.id
        });
        await article.save();
        res.json(article);
    } catch (err) { res.status(500).send('Server error'); }
});

router.put('/:id', auth, upload.single('file'), async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Article not found' });
        if (article.author.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

        const { title, content, videoUrl, tags } = req.body;
        if (title) article.title = title;
        if (content) article.content = content;
        if (videoUrl) article.videoUrl = videoUrl;
        if (tags) article.tags = tags;
        if (req.file) article.coverImage = `/uploads/${req.file.filename}`;
        await article.save();
        res.json(article);
    } catch (err) { res.status(500).send('Server error'); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Article not found' });
        if (article.author.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
        await article.deleteOne();
        res.json({ msg: 'Article deleted' });
    } catch (err) { res.status(500).send('Server error'); }
});

router.put('/:id/like', auth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Article not found' });
        const idx = article.likes.indexOf(req.user.id);
        if (idx > -1) article.likes.splice(idx, 1);
        else article.likes.push(req.user.id);
        await article.save();
        res.json(article);
    } catch (err) { res.status(500).send('Server error'); }
});

router.post('/:id/comment', auth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ msg: 'Article not found' });
        article.comments.push({ user: req.user.id, text: req.body.text });
        await article.save();
        const populated = await article.populate('comments.user', 'name');
        res.json(populated);
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;