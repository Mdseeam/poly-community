const mongoose = require('mongoose');

const DepartmentChatSchema = new mongoose.Schema({
    department: { type: String, required: true },
    semester: { type: String },
    polytechnicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Polytechnic' },
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DepartmentChat', DepartmentChatSchema);