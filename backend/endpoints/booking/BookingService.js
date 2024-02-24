const Booking = require('../booking/BookingModel');
const Slot = require('../booking/SlotModel');
const UserProfile = require('../userProfile/UserProfileModel')
const PetPass = require('../userProfile/petPass/PetPassModel')


/**
 * Retrieves bookings based on specified criteria.
 * @param {Object} criteria - The filter criteria for retrieving bookings.
 * @returns {Array} Array of bookings matching the criteria.
 */
async function getBookings(criteria = {}) {
    const bookings = await Booking.find(criteria)
        .populate("petPasses") // Populate pet pass details in the booking
        .populate({
            path: "bookedBy bookedFrom",
            select: "userID firstName profilePicture" // Select specific fields from bookedBy and bookedFrom
        })
        .sort({ date: 1, startTime: 1 }) // Sort bookings by date and start time
        .exec();

    // Throw an error if no bookings are found
    if (!bookings.length) {
        const filterString = JSON.stringify(criteria);
        throw new Error(`No bookings with ${filterString} found`);
    }
    return bookings;
}

/**
 * Creates a new booking based on the provided data.
 * @param {Object} data - Data required for creating a booking.
 * @returns {Object} The created booking object.
 */
async function createBooking(data) {
    // Destructuring the necessary data from the input
    const { bookedBy, slots, activities, petPasses, remarks, location } = data;

    // Validations to ensure essential data is present
    if (!bookedBy) {
        throw new Error('No bookedBy given.');
    }
    if (!slots || !slots.length) {
        throw new Error('No slots given.');
    }
    if (!activities || activities.length === 0) {
        throw new Error('At least one activity must be selected.');
    }

    if (activities.length > 2) {
        throw new Error('A maximum of two activities can be selected.');
    }

    if (!petPasses || petPasses.length === 0) {
        throw new Error('At least one petPass must be selected.');
    }

    if (petPasses.length > 5) {
        throw new Error('A maximum of five petPasses can be selected.');
    }

    const totalWeight = activities.reduce((sum, activity) => sum + activity.weight, 0);
    if (totalWeight !== 100) {
        throw new Error('The total weight of activities must sum up to 100%.');
    }

    const isWeightInStepsOfFive = activities.every(activity => activity.weight % 5 === 0);
    if (!isWeightInStepsOfFive) {
        throw new Error('Weights of activities must be in steps of 5%.');
    }

    if (!location) {
        throw new Error('Location is required.');
    }


    // Fetching slot details and validating their availability and compatibility
    const slotDetails = await Promise.all(
        slots.map(slotId => Slot.findById(slotId).orFail(new Error(`Slot with ID ${slotId} not found or invalid.`)))
    );

    let bookingDate;
    const bookedFromSet = new Set();
    let allSlotsAvailable = true;

    // Sorting slots by time to ensure they are in chronological order
    const sortedSlots = slotDetails.sort((a, b) => convertHhmmToMinutes(a.time) - convertHhmmToMinutes(b.time));

    for (let i = 0; i < sortedSlots.length; i++) {
        const slot = sortedSlots[i];

        if (slot.creator.toString() === bookedBy.toString()) {
            throw new Error('Booking cannot include slots created by the booking user.');
        }

        if (slot.status !== 'active') {
            allSlotsAvailable = false;
            break;
        }

        const slotDate = new Date(slot.date).toDateString();
        if (!bookingDate) {
            bookingDate = slotDate;
        } else if (slotDate !== bookingDate) {
            throw new Error('All slots must be on the same date.');
        }

        bookedFromSet.add(slot.creator.toString());

        if (i < sortedSlots.length - 1 && convertHhmmToMinutes(sortedSlots[i + 1].time) - convertHhmmToMinutes(slot.time) !== 15) {
            throw new Error('Slots are not consecutive.');
        }
    }

    if (!allSlotsAvailable) {
        throw new Error('One or more slots are not available.');
    }

    if (bookedFromSet.size !== 1) {
        throw new Error('All slots must be from the same user.');
    }

    // Setting booking details
    const bookedFrom = bookedFromSet.values().next().value;
    const date = sortedSlots[0].date;
    const startTime = sortedSlots[0].time;
    const totalDurationInMinutes = sortedSlots.length * 15;
    const totalDuration = convertMinutesToHhmm(totalDurationInMinutes);

    const startMinutes = convertHhmmToMinutes(startTime);
    const endMinutes = startMinutes + totalDurationInMinutes;
    const endTime = convertMinutesToHhmm(endMinutes);

    // Fetching provider profile and validating activities
    const providerProfile = await UserProfile.findOne({ user: bookedFromSet.values().next().value });
    if (!providerProfile) {
        throw new Error('Provider not found');
    }

    // Calculating total duration in hours for the entire booking
    const totalDurationHours = sortedSlots.length * (15 / 60);
    let totalPrice = 0;
    let totalRoundedDuration = 0;
    const roundedActivityDurations = [];

    activities.forEach(activity => {
        // Fetching details for each activity from the provider's profile
        const activityInfo = providerProfile[activity.activity];

        // Validating if the activity is offered by the provider
        if (!activityInfo || !activityInfo.offered) {
            throw new Error(`Activity ${activity.activity} is not offered by the provider.`);
        }

        // Calculating price and duration for each activity
        const pricePerHour = activityInfo.price;
        const activityDurationHours = totalDurationHours * (activity.weight / 100);
        const activityPrice = pricePerHour * activityDurationHours;
        activity.price = activityPrice.toFixed(2) // Setting the calculated price
        totalPrice += activityPrice;

        // Rounding duration to nearest minute
        const durationInMinutes = (totalDurationHours * 60) * (activity.weight / 100);
        const roundedDuration = Math.round(durationInMinutes);
        totalRoundedDuration += roundedDuration;

        // Adding each activity with its calculated duration
        roundedActivityDurations.push({
            ...activity,
            duration: roundedDuration,
        });
    });

    // Adjusting activity durations to match total booking duration
    if (totalRoundedDuration !== totalDurationInMinutes) {
        const difference = totalDurationInMinutes - totalRoundedDuration;
        // Sorting activities by duration to find which one to adjust
        roundedActivityDurations.sort((a, b) => a.duration - b.duration);
        // Adjusting the duration of the shortest or longest activity based on the difference
        const activityToAdjust = (difference > 0) ? roundedActivityDurations[0] : roundedActivityDurations[roundedActivityDurations.length - 1];
        activityToAdjust.duration += difference;
    }

    // Finalizing the activities with adjusted durations
    const finalActivities = roundedActivityDurations.map(activity => ({
        ...activity,
        duration: convertMinutesToHhmm(activity.duration)
    }));

    // Fetching and validating pet passes
    const petPassDetails = await Promise.all(
        petPasses.map(petPassId => PetPass.findById(petPassId).orFail(new Error(`PetPass with ID ${petPassId} not found or invalid.`)))
    );

    // Ensuring each pet pass belongs to the booking user and is supported by the provider
    petPassDetails.forEach(petPass => {
        const petType = petPass.type;
        if (petPass.creator.toString() !== bookedBy.toString()) {
            throw new Error(`PetPass ${petPass._id} does not belong to the user.`);
        }

        if ((!providerProfile.dog && petType === "Hund") || (!providerProfile.cat && petType === "Katze")) {
            throw new Error(`Service for ${petType} is not offered by the provider.`);
        }
    });

    // Creating and saving the booking
    const booking = new Booking({
        bookedBy,
        bookedFrom,
        slots: slots,
        date,
        startTime,
        endTime,
        totalDuration,
        totalPrice: totalPrice.toFixed(2),
        activities: finalActivities,
        petPasses: petPassDetails.map(petPass => petPass._id),
        remarks,
        status: 'requested',
        location,
        isNewCreator: true,
        isNewProvider: true
    });

    await booking.save();

    // Updating the status of the slots associated with the booking
    for (let slot of sortedSlots) {
        slot.status = 'requested';
        slot.booking = booking._id;
        await slot.save();
    }

    return booking;
}

function convertHhmmToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function convertMinutesToHhmm(minutes) {
    if (minutes % 1440 === 0) {
        return '00:00';
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}


/**
 * Manages the status of a booking based on the specified action.
 * @param {Object} data - Contains booking ID and the action to be performed on the booking.
 * @returns {Object} The updated booking object after applying the action.
 */
async function manageBooking(id, data) {
    const { userID, action } = data;
    // Validate booking ID and action
    if (!id) {
        throw new Error('Booking ID is required.');
    }
    if (!userID) {
        throw new Error('UserID is required.');
    }
    if (!['accept', 'decline', 'cancel'].includes(action)) {
        throw new Error('Invalid action provided.');
    }

    // Retrieve the booking and populate related slots
    let booking = await Booking.findById(id).populate('slots');
    if (!booking) {
        throw new Error(`No booking found with ID ${id}.`);
    };

    // Determine if the booking has already started or is within 24 hours of starting
    const bookingStart = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}`);
    const isWithin24Hours = new Date() >= new Date(bookingStart).setHours(bookingStart.getHours() - 24);

    // Perform actions based on the specified action
    switch (action) {
        case 'accept':
            // Accept the booking if its status is 'requested'
            if (booking.status !== 'requested') {
                throw new Error('Booking cannot be accepted in its current state.');
            }
            if (userID.toString() !== booking.bookedFrom.toString()) {
                throw new Error('Unauthorized.');
            }
            booking.status = 'accepted';
            booking.isNewCreator = true;
            updateSlotsStatus(booking.slots, 'booked');
            break;

        case 'decline':
            // Decline the booking if its status is 'requested'
            if (booking.status !== 'requested') {
                throw new Error('Booking cannot be declined in its current state.');
            }
            if (userID.toString() !== booking.bookedFrom.toString() && userID.toString() !== booking.bookedBy.toString()) {
                throw new Error('Unauthorized.');
            }
            if (userID.toString() === booking.bookedFrom.toString()) {
                booking.isNewCreator = true;
            }
            else {
                booking.isNewProvider = true;
            }
            booking.status = 'declined';
            updateSlotsStatus(booking.slots, 'active', true);
            break;

        case 'cancel':
            // Cancel the booking if its status is 'accepted'
            if (booking.status !== 'accepted') {
                throw new Error('Booking can only be cancelled if it is accepted.');
            }
            if (userID.toString() !== booking.bookedFrom.toString() && userID.toString() !== booking.bookedBy.toString()) {
                throw new Error('Unauthorized.');
            }
            // if (isWithin24Hours) {
            //     throw new Error('Booked booking can only be cancelled more than 24 hours before start time.');
            // }
            if (userID.toString() === booking.bookedBy.toString()) {
                booking.isNewProvider = true;
                updateSlotsStatus(booking.slots, 'active', true);
            }
            else if (userID.toString() === booking.bookedFrom.toString()) {
                booking.isNewCreator = true;
                deleteSlots(booking.slots);
            }
            booking.status = 'cancelled';
            break;
    }

    // Save and return the updated booking
    booking = await booking.save();
    return booking;
}


/**
 * Updates the status of multiple slots and optionally removes booking reference from them.
 * @param {Array} slots - Array of slot objects to be updated.
 * @param {string} newStatus - The new status to be set for these slots.
 * @param {boolean} removeBookingReference - Flag to decide if booking reference should be removed.
 */
async function updateSlotsStatus(slots, newStatus, removeBookingReference = false) {
    for (let slot of slots) {
        slot.status = newStatus; // Update the status of the slot
        if (removeBookingReference) {
            slot.booking = null; // Remove the booking reference if specified
        }
        await slot.save(); // Save the updated slot
    }
}

async function deleteSlots(slots) {
    for (let slot of slots) {
        await Slot.findByIdAndDelete(slot._id); // Slot aus der Datenbank entfernen
    }
}


async function updateIsNew(id, userID) {
    // Validate booking ID and userID
    if (!id) {
        throw new Error('Booking ID is required.');
    }
    if (!userID) {
        throw new Error('User ID is required.');
    }

    // Retrieve the booking
    let booking = await Booking.findById(id);
    if (!booking) {
        throw new Error(`No booking found with ID ${id}.`);
    };

    if (userID.toString() === booking.bookedBy.toString()) {
        booking.isNewCreator = false;
    }
    else if (userID.toString() === booking.bookedFrom.toString()) {
        booking.isNewProvider = false;
    } else {
        throw new Error('Unauthorized user.');
    }

    // Save and return the updated booking
    booking = await booking.save();
    return booking;
}

async function declineBookingReview(id, userID) {
    // Validate booking ID and userID
    if (!id) {
        throw new Error('Booking ID is required.');
    }
    if (!userID) {
        throw new Error('User ID is required.');
    }

    // Retrieve the booking
    let booking = await Booking.findById(id);
    if (!booking) {
        throw new Error(`No booking found with ID ${id}.`);
    };

    if (booking.status !== 'current' && booking.status !== 'done') {
        throw new Error('Review can only be created for current or done bookings');
    }

    if (userID.toString() === booking.bookedBy.toString()){
        if (booking.reviewCreator === true){
            throw new Error('Review can only be created once');
        }
        booking.reviewCreator = true; 
    }
    else if (userID.toString() === booking.bookedFrom.toString()){
        if (booking.reviewProvider === true){
            throw new Error('Review can only be created once');
        }
        booking.reviewProvider = true;
    }
 

    // Save and return the updated booking
    await booking.save();
    return booking;
}

module.exports = {
    getBookings,
    createBooking,
    manageBooking,
    updateIsNew,
    declineBookingReview
};
