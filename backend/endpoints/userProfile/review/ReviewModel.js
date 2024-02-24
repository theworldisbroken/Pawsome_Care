const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for replies to reviews
const reviewReplySchema = new mongoose.Schema({
    // 'text' field for the content of the reply
    text: { 
        type: String, 
        required: true 
    },
},
    { timestamps: true } 
);

// Schema for reviews
const reviewSchema = new mongoose.Schema({
    // 'creator' field: Reference to the user who created the review
    creator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // 'receiver' field: Reference to the user who is the subject of the review
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // 'text' field: Content of the review
    text: { 
        type: String, 
        required: true 
    },
    // 'reply' field: A reply to the review, using the reviewReplySchema
    reply: { 
        type: reviewReplySchema, 
        default: null 
    },
    // 'booking' field: Reference to a booking associated with the review
    booking: { 
        type: Schema.Types.ObjectId, 
        ref: 'Booking', 
        default: null 
    },
    // 'rating' field: Numerical rating given in the review
    rating: { 
        type: Number, 
        default: null 
    },
},
    { timestamps: true } 
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
