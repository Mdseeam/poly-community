const mongoose = require('mongoose');

const PolytechnicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String
    },
    description: {
        type: String
    },
    logo: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Polytechnic', PolytechnicSchema);