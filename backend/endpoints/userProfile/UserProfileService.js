const UserProfile = require("./UserProfileModel");

/**
 * Retrieves a user's profile based on their ID.
 * 
 * @param {String} userID - The ID of the user whose profile is to be retrieved.
 * @returns {Object} The user's profile.
 * @throws {Error} If no profile is found for the given userID.
 */
async function getUserProfile(userID) {
    const userProfile = await UserProfile.findOne({ user: userID })
        .populate({
            path: "user",
            select: "userID firstName last_logged_in profilePicture"
        })
        .exec();
    if (!userProfile) {
        throw new Error(`No userProfile with id ${userID} found`);
    }

    return userProfile;
}


/**
 * Updates a user profile with the provided data.
 * 
 * @param {String} userID - The ID of the user whose profile needs to be updated.
 * @param {Object} data - The new data to update the user profile with.
 * @returns {Object} The updated UserProfile document.
 * @throws {Error} If the userID or data is missing, or if the user profile is not found.
 */
async function updateUserProfile(userID, data) {
    // Check for the presence of userID and data
    if (!userID) {
        throw new Error("userID missing, cannot update");
    }
    if (!data) {
        throw new Error("data missing, cannot update");
    }

    // Find the user profile by userID
    const userProfile = await UserProfile.findOne({ user: userID }).populate({
        path: "user",
        select: "userID firstName last_logged_in profilePicture"
    }).exec();
    if (!userProfile) {
        throw new Error(`No userProfile with id ${userID} found, cannot update`);
    }

    // Update fields if they are present in the provided data
    if ('aboutme' in data) userProfile.aboutme = data.aboutme;
    if ('location' in data) {
        const locationData = data.location;
        if ('coordinates' in locationData) {
            userProfile.location.coordinates = locationData.coordinates;
        }
        if ('address' in locationData) {
            userProfile.location.address = locationData.address;
        }
    } 
    if ('dog' in data) userProfile.dog = data.dog;
    if ('cat' in data) userProfile.cat = data.cat;

    // List of service fields that can be updated
    const services = ['hausbesuch', 'gassi', 'training', 'herberge', 'tierarzt'];

    // Update each service data if present
    services.forEach(service => {
        if (service in data) {
            const serviceData = data[service];
            if ('price' in serviceData) {
                userProfile[service].price = serviceData.price;
            }
            if ('offered' in serviceData) {
                userProfile[service].offered = serviceData.offered;
            }
        }
    });



    // Save and return the updated profile
    try {
        await userProfile.save();
        return userProfile;
    } catch (error) {
        console.log(error)

        throw new Error("Error updating userProfile: " + error.message);
    }
}


/**
 * Toggles the favorite status of a user on another user's profile.
 * 
 * @param {String} userID - The ID of the user performing the toggle action.
 * @param {String} favoriteID - The ID of the user to be toggled as a favorite.
 * @returns {Object} The updated UserProfile document of the user performing the action.
 * @throws {Error} If either userID or favoriteID is missing, or if either profile is not found.
 */
async function toggleFavorite(userID, favoriteID) {
    // Validate the presence of userID and favoriteID
    if (!userID) {
        throw new Error("userID missing, cannot toggle");
    }
    if (!favoriteID) {
        throw new Error("favoriteID missing, cannot toggle");
    }

    // Check if the user is not trying to favorite themselves
    if (userID === favoriteID) {
        throw new Error("Cannot favorite oneself");
    }

    // Find the user profile and the favorite user profile
    const userProfile = await UserProfile.findOne({ user: userID });
    const favoriteProfile = await UserProfile.findOne({ user: favoriteID });

    // Check if both profiles exist
    if (!userProfile || !favoriteProfile) {
        throw new Error('Profile not found');
    }

    // Check if the favorite user is already in the user's favorites list
    const isFavorite = userProfile.favorites.includes(favoriteID);

    // Toggle the favorite status
    if (isFavorite) {
        userProfile.favorites.pull(favoriteID); // Remove from favorites
        favoriteProfile.favoritedBy.pull(userID); // Remove the user from favoritedBy list of the favorite user
    } else {
        userProfile.favorites.push(favoriteID); // Add to favorites
        favoriteProfile.favoritedBy.push(userID); // Add the user to favoritedBy list of the favorite user
    }

    // Save both profiles
    await userProfile.save();
    await favoriteProfile.save();
    return userProfile; // Return the updated user profile
}

module.exports = {
    getUserProfile,
    updateUserProfile,
    toggleFavorite
};