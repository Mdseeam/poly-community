const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{
        text: String,
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poll', PollSchema);