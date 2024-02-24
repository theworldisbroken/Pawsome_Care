const Review = require("./ReviewModel");
const UserProfile = require("../UserProfileModel");
const Booking = require("../../booking/BookingModel")


/**
 * Retrieves all reviews/posts received by a specific user.
 * 
 * @param {String} id - The ID of the user (receiver of the reviews).
 * @returns {Array} An array of review documents.
 * @throws {Error} If no reviews are found for the given user ID.
 */
async function getPostsByUser(id) {
    // Find all reviews where 'receiver' field matches the provided 'id'
    const post = await Review.find({ receiver: id })
    .populate({
        path: "creator",
        select: "userID firstName profilePicture"
    })
    .populate({
        path: "booking",
        select: "activities.activity"

    })
    .exec();

    // If no reviews are found, throw an error
    if (!post || post.length === 0) {
        throw new Error(`No posts for id ${id} found`);
    }
    return post;
}


/**
 * Creates a new post based on provided data.
 * 
 * @param {Object} data - Data for creating a new post.
 * @returns {Object} The created Review document.
 * @throws {Error} If required fields (creator, receiver, text) are missing or if the receiver's profile is not found.
 */
async function createPost(data) {
    const { creator, receiver, text } = data;

    // Validate required fields
    if (!creator) {
        throw new Error('No creator given.');
    }
    if (!receiver) {
        throw new Error('No receiver given.');
    }
    if (!text) {
        throw new Error('No text given.');
    }

    // Check if receiver's user profile exists
    const userProfile = await UserProfile.findOne({ user: receiver }).exec();
    if (!userProfile) {
        throw new Error('Receiver user profile not found');
    }

    // Create and return a new Review document
    const post = await Review.create({
        creator: creator,
        receiver: receiver,
        text: text,
        reply: null,
        booking: null,
        rating: null
    })
    return post;
}


/**
 * Creates a new review based on the provided data.
 * 
 * @param {Object} data - Data for creating a new review, including creator, receiver, text, bookingID, and rating.
 * @returns {Object} The created Review document.
 * @throws {Error} If required fields are missing, if rating is out of range, or if associated user profile or booking is not found.
 */
async function createReview(data) {
    const { creator, receiver, text, bookingID, rating } = data;

    // Validate the presence of required fields
    if (!creator) {
        throw new Error('No creator given.');
    }
    if (!receiver) {
        throw new Error('No receiver given.');
    }
    if (!text) {
        throw new Error('No text given.');
    }
    if (!bookingID) {
        throw new Error('No bookingID given.');
    }
    if (!rating) {
        throw new Error('No rating given.');
    }

    // Validate that the rating is within the allowed range (1 to 5)
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    // Check if the receiver's user profile exists
    const userProfile = await UserProfile.findOne({ user: receiver }).exec();
    if (!userProfile) {
        throw new Error('Receiver user profile not found');
    }

    // Check if the associated booking exists and its status
    const booking = await Booking.findById(bookingID).exec();
    if (!booking) {
        throw new Error('Booking not found');
    }
    if (booking.status !== 'current' && booking.status !== 'done') {
        throw new Error('Review can only be created for current or done bookings');
    }
    if (creator.toString() === booking.bookedBy.toString()) {
        if (booking.reviewCreator === true) {
            throw new Error('Review can only be created once');
        }
        booking.reviewCreator = true;
    }
    else if (creator.toString() === booking.bookedFrom.toString()) {
        if (booking.reviewProvider === true) {
            throw new Error('Review can only be created once');
        }
        booking.reviewProvider = true;
    }

    await booking.save();

    // Create the review
    const post = await Review.create({
        creator: creator,
        receiver: receiver,
        text: text,
        reply: null,
        booking: bookingID,
        rating: rating
    })

    // Update the receiver's user profile with the new rating
    userProfile.ratingCount = userProfile.ratingCount + 1;
    userProfile.ratingAverage = ((userProfile.ratingAverage * (userProfile.ratingCount - 1)) + rating) / userProfile.ratingCount;
    await userProfile.save();

    return post;
}


/**
 * Updates an existing post (review) with the provided data.
 * 
 * @param {String} id - The ID of the post to be updated.
 * @param {Object} data - Data for updating the post, including creator, text, and rating.
 * @returns {Object} The updated Review document.
 * @throws {Error} If required parameters are missing, if no post is found, or if the user is unauthorized to update the post.
 */
async function updatePostOrReview(id, data) {
    const { creator, text, rating } = data;

    // Validate the presence of required fields
    if (!id) {
        throw new Error('No id given.');
    }
    if (!creator) {
        throw new Error('No creator given.');
    }

    // Find the review by ID
    const post = await Review.findById(id).exec();
    if (!post) {
        throw new Error(`No post for id ${id} found`);
    }

    // Check if the user attempting the update is the creator of the review
    if (post.creator.toString() !== creator.toString()) {
        throw new Error('Unauthorized to update this post');
    }

    // Update the text of the review if provided
    if (text) post.text = text;

    // If rating is provided, handle the rating update
    if (rating) {

        // Ensure the review is associated with a booking
        if (post.booking === null) {
            throw new Error('No booking found');
        }

        // Validate that the rating is within the allowed range
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        // Update the rating and adjust the receiver's average rating
        const oldRating = post.rating;
        post.rating = rating;

        // Update the receiver's user profile with the new average rating
        const userProfile = await UserProfile.findOne({ user: post.receiver }).exec();
        userProfile.ratingAverage = ((userProfile.ratingAverage * userProfile.ratingCount) - oldRating + rating) / userProfile.ratingCount;
        await userProfile.save()
    }

    // Save and return the updated review
    await post.save()
    return post;
}


/**
 * Deletes a review (post) based on the given ID, with authorization checks.
 * 
 * @param {String} id - The ID of the post to be deleted.
 * @param {String} userID - The ID of the user attempting to delete the post.
 * @throws {Error} If required parameters are missing, if no post is found, or if the user is unauthorized to delete the post.
 */
async function deletePostOrReview(id, userID) {
    // Validate the presence of required parameters
    if (!id) {
        throw new Error('No id given.');
    }
    if (!userID) {
        throw new Error('No userID given.');
    }

    // Find the review by ID
    const post = await Review.findById(id).exec();
    if (!post) {
        throw new Error(`No post with id ${id} found`);
    }

    // Check if the user attempting the deletion is either the creator or the receiver of the review
    const isCreator = post.creator.toString() === userID.toString();
    const isReceiver = post.receiver.toString() === userID.toString();

    // Authorization check: Only allow deletion if the user is the creator, or if the user is the receiver and the post is not linked to a booking
    if (!isCreator && (!isReceiver || (isReceiver && post.booking !== null))) {
        throw new Error('Unauthorized to delete this post');
    }

    // If the post is linked to a booking and has a rating, adjust the receiver's average rating
    if (post.booking !== null && post.rating !== null) {
        const userProfile = await UserProfile.findOne({ user: post.receiver }).exec();

        // Update the receiver's rating average and count
        if (userProfile.ratingCount > 1) {
            userProfile.ratingAverage = ((userProfile.ratingAverage * userProfile.ratingCount) - post.rating) / (userProfile.ratingCount - 1);
        } else {
            userProfile.ratingAverage = 0; // Reset to 0 if this was the only rating
        }
        userProfile.ratingCount -= 1;

        await userProfile.save();
    }

    // Delete the review
    await Review.deleteOne({ _id: id }).exec();
}


/**
 * Creates, updates, or deletes a reply to a review based on the provided data.
 * 
 * @param {String} id - The ID of the review to which the reply is to be added, updated, or deleted.
 * @param {Object} data - Data for creating or updating the reply, including the creator and text of the reply.
 * @returns {Object} The updated Review document.
 * @throws {Error} If required parameters are missing, if no review is found, or if the user is unauthorized.
 */
async function createOrUpdateOrDeleteReply(id, data) {
    const { creator, text } = data;

    // Validate the presence of required parameters
    if (!id) {
        throw new Error('No id given.');
    }
    if (!creator) {
        throw new Error('No creator given.');
    }

    // Find the review by ID
    const post = await Review.findById(id).exec();
    if (!post) {
        throw new Error(`No post for id ${id} found`);
    }

    // Check if the user attempting the action is the receiver of the review
    if (post.receiver.toString() !== creator.toString()) {
        throw new Error(`Creator must be owner`);
    }

    // If 'text' is not provided, delete the reply; otherwise, create or update it
    if (!text) {
        post.reply = null;
    } else {
        if (!post.reply) {
            post.reply = { text: text};
        } else {
            post.reply.text = text;
     }
    }

    // Speichern des Posts ohne die Verwendung von findByIdAndUpdate
    await post.save({ timestamps: { createdAt: false, updatedAt: false } });
    
    return post;
}



module.exports = {
    getPostsByUser,
    createPost,
    createReview,
    updatePostOrReview,
    deletePostOrReview,
    createOrUpdateOrDeleteReply
};