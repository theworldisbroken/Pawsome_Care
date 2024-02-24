const PetPass = require("./PetPassModel");

/**
 * Retrieves all pet passes created by a specific user.
 * 
 * @param {String} id - The ID of the creator (user) whose pet passes are to be retrieved.
 * @returns {Array} An array of PetPass documents.
 * @throws {Error} If no pet passes are found for the given creator ID.
 */
async function getPetPassesByCreator(id) {
    // Find all pet passes where the 'creator' field matches the provided 'id'
    const petPasses = await PetPass.find({ creator: id }).exec();

    // If no pet passes are found, throw an error
    if (!petPasses || petPasses.length === 0) {
        throw new Error(`No petPasses for id ${id} found`);
    }

    return petPasses;
}


/**
 * Creates a new pet pass with the provided data.
 * 
 * @param {Object} data - Data for creating a new pet pass.
 * @returns {Object} The created PetPass document.
 * @throws {Error} If required data fields are missing.
 */
async function createPetPass(data) {
    // Destructure and validate required fields from data
    const { 
        creator, 
        picture,
        type,
        name,
        race,
        gender,
        age,
        size,
        fur,
        personalities,
        diseases,
        allergies,
        houseTrained,
        sterilized,
        vaccinated,
        chipped,
    } = data;

    // Check for the presence of required fields
    if (!creator || /* !picture || */ !type || !name || !race || !gender || !age || !size || !fur || personalities.length === 0) {
        throw new Error('Not enough data given.');
    }

    // Create and return a new PetPass document
    const petPass = await PetPass.create({
        creator: creator,
        picture: picture,
        type: type,
        name: name,
        race: race,
        gender: gender,
        age: age,
        size: size,
        fur: fur,
        personalities: personalities,
        diseases: diseases,
        allergies: allergies,
        houseTrained: houseTrained,
        sterilized: sterilized,
        vaccinated: vaccinated,
        chipped: chipped,
    })
    return petPass;
}


/**
 * Updates an existing pet pass with the provided data.
 * 
 * @param {String} id - The ID of the pet pass to update.
 * @param {Object} data - Data for updating the pet pass.
 * @returns {Object} The updated PetPass document.
 * @throws {Error} If the pet pass ID is not provided or the pet pass is not found.
 */
async function updatePetPass(id, data) {
    // Validate the pet pass ID
    if (!id) {
        throw new Error('No id given.');
    }

    // Find the pet pass by ID
    const petPass = await PetPass.findById(id).exec();
    if (!petPass) {
        throw new Error('PetPass not found');
    }

    // Update fields if they are provided in the 'data' object
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) petPass[key] = data[key];
    });

    // Save and return the updated pet pass
    await petPass.save();
    return petPass;
}


/**
 * Deletes a pet pass by its ID.
 * 
 * @param {String} id - The ID of the pet pass to delete.
 * @throws {Error} If the pet pass ID is not provided or no pet pass is deleted.
 */
async function deletePetPass(id) {
    // Validate the pet pass ID
    if (!id) {
        throw new Error('No id given.');
    }

    // Attempt to delete the pet pass
    const res = await PetPass.deleteOne({ _id: id }).exec();
    if (res.deletedCount !== 1) {
        throw new Error(`No petPass with id ${id} deleted, probably id not valid`);
    }
}

module.exports = {
    getPetPassesByCreator,
    createPetPass,
    updatePetPass,
    deletePetPass
};