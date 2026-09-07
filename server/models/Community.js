const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    polytechnicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Polytechnic' },
    isPrivate: { type: Boolean, default: false },
    password: { type: String, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Community', CommunitySchema);