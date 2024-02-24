const Slot = require('../booking/SlotModel');


/**
 * Retrieves slots from the database based on provided criteria.
 * @param {Object} criteria - An object containing filtering criteria for the slots.
 * @returns {Array} An array of slot documents that match the criteria.
 */
async function getSlots(criteria = {}) {
    const filter = {};
    filter.date = { $gte: new Date().toISOString().split('T')[0] }; // Sets a base filter to retrieve slots with dates greater than or equal to the current date

    // Conditionally add criteria to the filter based on the presence of these fields in the 'criteria' object
    if (criteria.creator) filter.creator = criteria.creator; // Filter by 'creator' if provided
    if (Array.isArray(criteria.date)) {
        // If 'date' is an array, filter by dates within the provided array
        filter.date = { ...filter.date, $in: criteria.date.map(date => new Date(date)) };
    }
    if (criteria.time) filter.time = criteria.time; // Filter by 'time' if provided
    if (criteria.status) filter.status = criteria.status; // Filter by 'status' if provided
    if (criteria.booking) filter.booking = criteria.booking; // Filter by 'booking' if provided

    // Execute the query to find slots that match the filter
    const slots = await Slot.find(filter).exec();

    // If no slots are found, throw an error
    if (!slots.length) {
        throw new Error(`No slots with criteria found`);
    }

    // Return the array of found slots
    return slots;
}


/**
 * Creates new slots based on the provided data.
 * @param {Object} data - Data required for creating slots. Includes 'creator', 'dates', and 'times'.
 * @returns {Array} An array of created or existing slot documents.
 */
async function createSlot(data) {
    const { creator, dates, times } = data;

    // Validate input data: creator, dates, and times must be provided
    if (!creator) {
        throw new Error('No creator given.'); // Error if no creator is provided
    }
    if (!dates || !dates.length) {
        throw new Error('No dates given.'); // Error if no dates are provided or if dates array is empty
    }
    if (!times || !times.length) {
        throw new Error('No times given.'); // Error if no times are provided or if times array is empty
    }

    const slots = []; // Initialize an array to store the created or found slots

    // Iterate over each date and time combination to create slots
    for (const date of dates) {
        for (const time of times) {
            const filter = {
                creator: creator,
                date: date,
                time: time,
            };

            // Check if a slot with the given criteria already exists
            let slot = await Slot.findOne(filter);
            if (!slot) {
                // If no existing slot found, create a new slot
                slot = new Slot(filter);
                await slot.save(); // Save the new slot to the database
            }

            // Add the created or found slot to the slots array
            slots.push(slot);
        }
    }

    // Return the array of slots
    return slots;
}


/**
 * Deletes slots based on the provided data.
 * @param {Object} data - Data required for deleting slots. Includes 'creator', 'dates', and 'times'.
 * @throws {Error} Throws an error if the required data is missing or if no slots match the deletion criteria.
 */
async function deleteSlot(data) {
    const { creator, dates, times } = data;

    // Validate input data: ensure 'creator', 'dates', and 'times' are provided
    if (!creator) {
        throw new Error('No creator given.'); // Error if no creator is specified
    }
    if (!dates || !dates.length) {
        throw new Error('No dates given.'); // Error if no dates are provided or if dates array is empty
    }
    if (!times || !times.length) {
        throw new Error('No times given.'); // Error if no times are provided or if times array is empty
    }

    // Construct a filter for identifying the slots to be deleted
    const filter = {
        creator: creator,
        date: { $in: dates }, // Filter to match any of the specified dates
        time: { $in: times }, // Filter to match any of the specified times
        status: 'active' // Only delete slots that are currently active
    };

    // Execute the deletion of slots matching the filter
    const res = await Slot.deleteMany(filter);

    // Check if any slots were deleted
    if (res.deletedCount === 0) {
        // If no slots were deleted, throw an error
        throw new Error(`No active slots found for the specified dates.`);
    }
}

async function manageSlots(data) {
    const { creator, dates, times } = data;

    if (!creator) {
        throw new Error('No creator given.');
    }
    if (!dates || dates.length === 0) {
        throw new Error('No dates given.');
    }
    if (!times || times.length === 0) {
        throw new Error('No times given.');
    }

    const results = {
        created: 0,
        deleted: 0,
    };

    const slotsToCreate = [];
    const slotsToDelete = [];


    for (const time of times) {
        let deleteSlots = true;

        for (const date of dates) {
            const filter = { creator, date, time };
            let slot = await Slot.findOne(filter);

            if (!slot) {
                slotsToCreate.push(new Slot(filter))
                deleteSlots = false;
            }
        }
        if (deleteSlots) {
            slotsToDelete.push(time);
        }
    }
    if (slotsToCreate.length > 0) {
        const createdSlots = await Slot.create(slotsToCreate);
        results.created = createdSlots.length;
    }
    if (slotsToDelete.length > 0) {
        const deleteFilter = {
            creator: creator,
            date: { $in: dates },
            time: { $in: slotsToDelete },
            status: 'active'
        };
        const deleteResponse = await Slot.deleteMany(deleteFilter);
        results.deleted = deleteResponse.deletedCount;
    }

    return results;
}



    module.exports = {
        getSlots,
        createSlot,
        deleteSlot,
        manageSlots
    };
