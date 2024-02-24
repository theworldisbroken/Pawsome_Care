const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Activity Schema
 * This schema represents the different activities or services offered by a user.
 */
const activitySchema = new Schema({
    // Name of the activity. It's an enum with pre-defined values.
    offered: {
        type: Boolean,
        default: false,
    },
    // Price of the activity. Must be a positive number and within the defined range.
    price: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    }
}, { _id: false });


/**
 * User Profile Schema
 * This schema represents the profile of a user, including their personal details and activities they offer.
 */
const userProfileSchema = new mongoose.Schema({
    // Reference to the User model. Each profile is associated with a user.
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // About me section of the user profile.
    aboutme: { type: String, default: "" },

    // Location of the user.
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point' // Standardtyp festlegen
        },
        coordinates: {
            type: [Number], // Array von Zahlen für Längen- und Breitengrad
            default: [51, 10] // Standardwerte für Koordinaten
        },
        address: {
            type: String,
            default: null // Standardwert für die Adresse
        }
    },

    // Indicates whether the user can accommodate dogs.
    dog: { type: Boolean, default: false },
    // Indicates whether the user can accommodate cats.
    cat: { type: Boolean, default: false },
    // Activities that the user offers. Based on the activitySchema.
    hausbesuch: activitySchema,
    gassi: activitySchema,
    training: activitySchema,
    herberge: activitySchema,
    tierarzt: activitySchema,
    // Average rating of the user based on user reviews.
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    // Total number of ratings the user has received.
    ratingCount: { type: Number, default: 0 },
    // Array of User IDs who have been marked as favorites by this user.
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Array of User IDs representing users who have marked this user as a favorite.
    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

userProfileSchema.index({ location: '2dsphere' });


const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;