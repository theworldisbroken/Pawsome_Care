const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for individual activities in a booking
const activitySchema = new mongoose.Schema({
    activity: {
        type: String,
        enum: ['gassi', 'tierarzt', 'hausbesuch', 'herberge', 'training'],
        required: true
    },
    weight: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    duration: {
        type: String,
        required: true,
        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/
    },
    price: {
        type: Number,
        required: true
    },
});

// Define schema for booking
const bookingSchema = new mongoose.Schema({
    // Reference to the user who made the booking
    bookedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to the user who is offering the service
    bookedFrom: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Array of slot references, indicating the time slots for the booking
    slots: [{
        type: Schema.Types.ObjectId,
        ref: 'Slot',
        required: true
    }],
    // Date of the booking
    date: {
        type: Date,
        required: true
    },
    // Start time of the booking, in HH:MM format
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/
    },
    // End time of the booking, in HH:MM format
    endTime: {
        type: String,
        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/
    },
    // Total duration of the booking, in HH:MM format with 15-minute increments
    totalDuration: {
        type: String,
        required: true,
        match: /^(0\d|1\d|2[0-3]):(00|15|30|45)$/
    },
    // Total price for the booking
    totalPrice: {
        type: Number,
        required: true
    },
    // Array of activities included in the booking
    activities: [activitySchema],
    // Array of pet pass references, indicating the pets involved in the booking
    petPasses: [{
        type: Schema.Types.ObjectId,
        ref: 'PetPass',
        required: true
    }],
    // Optional remarks or special instructions for the booking
    remarks: { type: String },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'declined', 'cancelled', 'current', 'done'],
        default: 'requested',
    },
    location: {
        address: {
            type: String,
            default: "",
            required: true
        },
        lat: {
            type: Number,
            default: null,
            required: true
        },
        lng: {
            type: Number,
            default: null,
            required: true
        }
    },
    reviewCreator: { 
        type: Boolean,
        default: false
    },
    reviewProvider: { 
        type: Boolean,
        default: false
    },
    isNewCreator: {
        type: Boolean,
        default: true
    },
    isNewProvider: {
        type: Boolean,
        default: true
    }
}, { timestamps: true }) // Timestamps for creation and last update

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
