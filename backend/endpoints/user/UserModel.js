const mongoose = require('mongoose');
const bcrypt = require('bcrypt')


// Ein Schema definiert die Form wie ein Dokument(Objekt) aussehen soll und welche Attributen es hat
const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    firstName: String,
    lastName: String,
    password: {
        type: String, required: true,
        validate: {
            validator: function (value) {
                return /^(?=.*[A-Z]).{8,}$/.test(value);
            }
        }
    },
    isAdministrator: { type: Boolean, default: false },
    activationLinkEnding: String,
    // isVerified: true wenn der User sich per Link in seiner EMail bestaetigt hat
    isVerified: { type: Boolean, default: false },
    profilePicture: String,
    last_logged_in: Date
});

// Ein Middleware Function bei einem POST Request(save), um das Passowrd zu hashen mit bcrypt
userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next()
    };
    bcrypt.hash(user.password, 10).then((hashedPassword) => {
        user.password = hashedPassword;
        next();
    })
});

// Middleware nach dem Speichern eines Benutzers
userSchema.post('save', async function () {
    const UserProfile = require("../userProfile/UserProfileModel")
    // Überprüfen, ob bereits ein Profil vorhanden ist
    const existingProfile = await UserProfile.findOne({ user: this._id });
    if (!existingProfile) {
        // Erstellen eines neuen Profils
        const newProfile = new UserProfile({
            user: this._id,
            // Setzen von Standardwerten
            hausbesuch: {},
            gassi: {},
            training: {},
            herberge: {},
            tierarzt: {}
        });
        await newProfile.save();
    }
});

// Eine Funkion, um die Passwörter(gespeicherte und eingegebene beim Login) zu vergleichen
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
};

const User = mongoose.model("User", userSchema);

module.exports = User;