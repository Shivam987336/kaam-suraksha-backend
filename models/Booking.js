const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    service: { type: String, required: true },
    bookingType: { type: String, required: true }, 
    scheduleType: { type: String },
    address: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } 
    },
    price: { type: Number, default: 0 },
    items: { type: Array, default: [] },
    issue: { type: String },
    status: { type: String, default: 'pending' }, 
    startOtp: { type: String },
    bids: [{
        provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number },
        message: { type: String }
    }],
    rating: { type: Number },
    review: { type: String }
}, { timestamps: true });

bookingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);