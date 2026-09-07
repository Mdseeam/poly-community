const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    fileUrl: String,
    subject: String,
    department: String,
    semester: String,
    imageUrl: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);