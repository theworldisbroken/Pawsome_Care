const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for a Pet Pass
const petPassSchema = new mongoose.Schema({
    // 'creator' field: Reference to the user who created this pet pass
    creator: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // 'picture' field: URL or path to the pet's picture
    picture: {
        type: String, 
        // required: true 
    },
    // 'type' field: The type of pet (e.g., dog, cat)
    type: {
        type: String, 
        required: true 
    },
    // 'name' field: The name of the pet
    name: {
        type: String, 
        required: true 
    },
    // 'race' field: The breed or race of the pet
    race: {
        type: String, 
        required: true, 
    },
    // 'gender' field: The gender of the pet
    gender: {
        type: String, 
        required: true, 
    },
    // 'age' field: The age of the pet
    age: {
        type: Number, 
        min: 0, 
        max: 99 
    },
    // 'size' field: The size category of the pet
    size: {
        type: String, 
        required: true 
    },
    // 'fur' field: Description of the pet's fur
    fur: {
        type: String, 
        required: true 
    },
    // 'personalities' field: Array of strings describing the pet's personality
    personalities: [{
        type: String, 
        required: true 
    }],
    // 'diseases' field: Description of any diseases the pet may have
    diseases: {
        type: String, 
    },
    // 'allergies' field: Description of any allergies the pet may have
    allergies: {
        type: String, 
    },
    // 'houseTrained' field: Boolean indicating if the pet is house trained
    houseTrained: {
        type: Boolean 
    },
    // 'sterilized' field: Boolean indicating if the pet is sterilized
    sterilized: {
        type: Boolean 
    },
    // 'vaccinated' field: Boolean indicating if the pet is vaccinated
    vaccinated: {
        type: Boolean 
    },
    // 'chipped' field: Boolean indicating if the pet has an identification chip
    chipped: {
        type: Boolean 
    }
});

const PetPass = mongoose.model("PetPass", petPassSchema);
module.exports = PetPass;
