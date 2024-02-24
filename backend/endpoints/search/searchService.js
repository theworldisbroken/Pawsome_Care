
const UserProfile = require("../userProfile/UserProfileModel");

/**
 * Retrieves user profiles based on specified filtering conditions.
 * @param {Object} options - Contains options for pagination and filters.
 * @returns {Array} An array of user profiles that match the filter criteria.
 */
async function getFilteredProfiles({ page = 1, limit = 30, filter = {}, sortOption = "active" }) {

    // Initialize aggregation pipeline
    const pipeline = [];

    // Prepare conditions based on provided filters
    let matchCondition = {};

    let petCondition = { '$or': [{ dog: true }, { cat: true }] };
    let serviceCondition = {
        '$or': [
            { 'hausbesuch.offered': true },
            { 'gassi.offered': true },
            { 'training.offered': true },
            { 'herberge.offered': true },
            { 'tierarzt.offered': true }
        ]
    };
    let addressCondition = { 'location.address': { $ne: null } };
    matchCondition['$and'] = [petCondition, serviceCondition, addressCondition];


    // For service filters, add conditions to match services offered by users
    if (filter.services && filter.services.length > 0) {
        filter.services.forEach(service => {
            matchCondition[`${service}.offered`] = true;
        });
    }

    // For pet filters, add conditions to match users who have specific pets
    if (filter.pets) {
        filter.pets.forEach(pet => {
            matchCondition[pet] = true;
        });
    }

    const topLeft = filter.location ? filter.location.topLeft : {lat: 54.864028001772866, lng: -2.5903320312499956};
    const bottomRight = filter.location ? filter.location.bottomRight : {lat: 47.14497437544359, lng: 21.623535156250004};
    let rectangleCondition = {
        "location.coordinates.0": { $gte: parseFloat(bottomRight.lat), $lte: parseFloat(topLeft.lat) },
        "location.coordinates.1": { $gte: parseFloat(topLeft.lng), $lte: parseFloat(bottomRight.lng) }
    };
    matchCondition['$and'] = [petCondition, serviceCondition, addressCondition, rectangleCondition];

 
    const center = filter.location ? filter.location.center : {lat: 51.165637488221606, lng: 9.516601562500004};
    const searchPoint = {
        type: "Point",
        coordinates: [parseFloat(center.lat), parseFloat(center.lng)]
    };

    pipeline.push({
        $geoNear: {
            near: searchPoint,
            distanceField: "distance",
            spherical: true,
            query: matchCondition
        }
    });

    // Handling date and time filters using $lookup to join with 'slots' collection
    pipeline.push({
        $lookup: {
            from: "slots",
            localField: "user",
            foreignField: "creator",
            as: "availableSlots"
        }
    });
    pipeline.push({ $unwind: "$availableSlots" });

    // Condition for matching slots by status, dates, and times
    const slotMatchCondition = { "availableSlots.status": "active" };

    // Adding date and time conditions for slots
    if (Array.isArray(filter.dates)) {
        // Handling single date or date range
        if (filter.dates.length === 1) {
            slotMatchCondition["availableSlots.date"] = new Date(filter.dates[0]);
        } else if (filter.dates.length === 2) {
            slotMatchCondition["availableSlots.date"] = {
                $gte: new Date(filter.dates[0]),
                $lte: new Date(filter.dates[1])
            };
        }
    }

    if (Array.isArray(filter.times)) {
        // Handling single time or time range
        if (filter.times.length === 1) {
            slotMatchCondition["availableSlots.time"] = filter.times[0];
        } else if (filter.times.length === 2) {
            slotMatchCondition["availableSlots.time"] = {
                $gte: filter.times[0],
                $lte: filter.times[1]
            };
        }
    }

    // Apply the slot match condition to the pipeline
    pipeline.push({ $match: slotMatchCondition });


    // Lookup to join user data
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userData'
        }
    });

    // Unwind the joined user data for further processing
    pipeline.push({
        $unwind: '$userData'
    });

    // Grouping by profile ID to consolidate data
    pipeline.push({
        $group: {
            _id: "$_id",
            profileData: { $first: "$$ROOT" },
        }
    });

    pipeline.push({
        $addFields: {
            favoritesCount: { $size: "$profileData.favoritedBy" },
            distance: { $round: ["$profileData.distance", 0] } 
        }
    });

    const sortCriteria = {};
    if (sortOption === 'active') {
        sortCriteria['profileData.userData.last_logged_in'] = -1;
    }
    else if (sortOption === 'rating') {
        sortCriteria['profileData.ratingAverage'] = -1;
    }
    else if (sortOption === 'popularity') {
        sortCriteria['favoritesCount'] = -1;
    }
    else if (sortOption === 'distance') {
        sortCriteria['profileData.distance'] = 1;
    }

    if (Object.keys(sortCriteria).length > 0) {
        pipeline.push({ $sort: sortCriteria });
    }

    // Projecting (selecting) the required fields and excluding sensitive data like password and email
    pipeline.push({
        $project: {
            'profileData.userData.activationLinkEnding': 0,
            'profileData.userData.password': 0,
            'profileData.userData.email': 0,
            'profileData.userData.isAdministrator': 0,
            'profileData.userData.isVerified': 0,
            'profileData.userData.verifiedIdentity': 0,
            'profileData.availableSlots': 0,
            'profileData.favorites': 0,
        }
    });

    // Pagination: skip and limit stages
    const skipDocuments = (page - 1) * limit;
    pipeline.push({
        $facet: {
            paginatedResults: [{ $skip: skipDocuments }, { $limit: limit }],
            totalCount: [{ $count: "count" }]
        }
    });

    try {
        // Ausführen der Aggregationspipeline
        const result = await UserProfile.aggregate(pipeline).exec();
        
        // Extrahieren von paginierten Ergebnissen und Gesamtanzahl
        const profiles = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
    
        return { profiles, totalCount };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getFilteredProfiles,
};