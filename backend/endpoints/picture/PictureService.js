const Picture = require('./PictureModel')

async function getAllPictures() {
    return await Picture.find();
}

async function findPictureByID(id) {
    if (id) {
        return await Picture.findOne({ _id: id }).exec();
    }
}

async function createPicture(picData) {
    const picture = new Picture({
        filename: picData.filename,
        path: picData.path,
        contentType: picData.mimetype
    });
    return await picture.save();
}

async function deletePicture(id) {
    if (id) {
        return await Picture.findOneAndDelete({ _id: id });
    }
}

module.exports = { getAllPictures, findPictureByID, createPicture, deletePicture }