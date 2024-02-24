const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for a slot
const slotSchema = new mongoose.Schema({
    // 'creator' field: Reference to the user who created the slot
    creator: { 
        type: Schema.Types.ObjectId, // MongoDB ObjectId referencing a 'User'
        ref: 'User', 
        required: true
    }, 

    // 'date' field: The date for the slot
    date: { 
        type: Date, 
        required: true 
    }, 

    // 'time' field: The specific time for the slot
    time: { 
        type: String, 
        required: true, 
        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/ // Regex to ensure time is in HH:MM format
    }, 

    // 'status' field: The current status of the slot
    status: { 
        type: String,
        enum: ['active', 'booked', 'requested'], // Allowed values for the status
        default: 'active', 
        required: true 
    },
    // 'booking' field: Reference to a booking, if the slot is booked
    booking: {
        type: Schema.Types.ObjectId, // MongoDB ObjectId referencing a 'Booking'
        ref: 'Booking',
        default: null 
    },
});

const Slot = mongoose.model("Slot", slotSchema);

module.exports = Slot;
