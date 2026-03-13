const mongoose = require('mongoose');

const monitoringDataSchema = new mongoose.Schema({
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    pollutantType: {
        type: String,
        required: [true, 'Please select a pollutant type']
    },
    value: {
        type: Number,
        required: [true, 'Please add a value']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MonitoringData', monitoringDataSchema);
