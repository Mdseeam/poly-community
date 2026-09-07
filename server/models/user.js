const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    department: { type: String, default: 'Computer' },
    semester: { type: String, default: '1st' },
    polytechnicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Polytechnic' },
    profilePic: { type: String, default: '' },
    bio: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);