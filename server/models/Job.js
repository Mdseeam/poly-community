const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: String,
    location: String,
    description: String,
    type: { type: String, enum: ['full-time', 'part-time', 'internship', 'contract'] },
    imageUrl: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);