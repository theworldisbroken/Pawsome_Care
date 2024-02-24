const User = require("./UserModel")

// Eine Funkion, um alle users aus dem Model zu holen
async function getUsers() {
    const allUsers = await User.find();
    return allUsers;
}

async function findUserByID(id) {
    if (id) {
        const user = await User.findOne({ _id: id }).exec();
        return user
    }
}
// Eine Funkion, um einen user durch seinen userID aus dem Model zu holen
async function findUser(userID) {
    if (userID) {
        const user = await User.findOne({ userID: userID }).exec();
        return user
    }
}

async function findUserByEmail(email) {
    if (email) {
        const user = await User.findOne({ email: email }).exec();
        return user
    }
}

async function findUserByProfilePic(picID) {
    if (picID) {
        const user = await User.findOne({ profilePicture: picID }).exec();
        return user
    }
}

async function createUser(userData) {
    if (userData) {
        const user = new User(userData);
        return await user.save();
    }
}

async function updateUser(userID, userData) {
    if (userID) {
        const bodyData = Object.keys(userData);
        const user = await findUser(userID)
        if (user) {
            for (let i of bodyData) {
                user[i] = userData[i]
            }
            return await user.save()
        }
    }
}

async function updateSelfUser(userID, userData) {
    if (userID) {
        const bodyData = Object.keys(userData);
        const user = await findUser(userID)
        if (!bodyData.includes("isAdministrator") && !bodyData.includes("isVerified") && !bodyData.includes("verifiedIdentity")) {
            if (user) {
                for (let i of bodyData) {
                    user[i] = userData[i]
                }
                return await user.save()
            }
        }
        throw new Error();
    }
}

async function updateVerifiedUser(linkEnding) {
    const user = await User.findOne({ activationLinkEnding: linkEnding }).exec();
    if (user) {
        user.activationLinkEnding = null
        user.isVerified = true
        return await user.save();
    }
}

async function updateProfilePicture(id, pictureID) {
    if (id) {
        const user = await findUserByID(id)
        if (user) {
            user.profilePicture = pictureID
            return await user.save()
        }
    }
}

async function deleteUser(userID) {
    if (userID) {
        return await User.findOneAndDelete({ userID: userID });
    }
}

async function deleteProfilePicture(id) {
    if (id) {
        const user = await findUserByID(id)
        if (user) {
            user.profilePicture = null;
            return await user.save()
        }
    }
}

async function automaticallyCreateAdmin() {
    const admin = await findUser("admin");
    if (!admin) {
        const adminUser = new User({
            "userID": "admin",
            "email": "admin@bht-berlin.de",
            "password": "Pawsomecare2324",
            "isAdministrator": true,
            "isVerified": true,
            "verifiedIdentity": true
        });
        await adminUser.save();
    }
}

module.exports = {
    getUsers,
    createUser,
    findUser,
    findUserByID,
    findUserByEmail,
    findUserByProfilePic,
    updateUser,
    updateSelfUser,
    updateProfilePicture,
    updateVerifiedUser,
    deleteUser,
    deleteProfilePicture,
    automaticallyCreateAdmin
}