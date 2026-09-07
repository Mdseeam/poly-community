const express = require('express');
const router = express.Router();
const Polytechnic = require('../models/Polytechnic');
const Community = require('../models/Community');

// সব পলিটেকনিক
router.get('/', async (req, res) => {
    try {
        const polytechnics = await Polytechnic.find();
        res.json(polytechnics);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// নতুন পলিটেকনিক
router.post('/', async (req, res) => {
    try {
        const { name, shortName, location, description } = req.body;
        const poly = new Polytechnic({ name, shortName, location, description });
        await poly.save();

        const community = new Community({
            polytechnicId: poly._id,
            name: `${poly.name} Community`,
            description: `Official community for ${poly.name}`
        });
        await community.save();

        res.json(poly);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;