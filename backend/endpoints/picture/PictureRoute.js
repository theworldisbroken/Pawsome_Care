const express = require('express');
const router = express.Router();
const fs = require('fs');
const { unlink } = fs;

const AuthenticationService = require('../authentication/AuthenticationService')
const ForumPostService = require('../forum/ForumService')
const PictureService = require("./PictureService")
const UserService = require('../user/UserService')

const multer = require('multer');
const uploadProfilePicture = multer({ dest: './uploads/profilepictures' })
const uploadPostPicture = multer({ dest: './uploads/postpictures' })


/**
 * @swagger
 * components:
 *   schemas:
 *     Picture:
 *       type: object
 *       properties:
 *         filename:
 *           type: string
 *           description: Name of the picture file
 *         path:
 *           type: string
 *           description: Path where the picture file is stored
 *         contentType:
 *           type: string
 *           description: MIME type of the picture
 */

/**
 * @swagger
 * /api/picture/:
 *   get:
 *     tags:
 *       - Picture
 *     summary: Retrieves all pictures
 *     description: Provides a list of all pictures. Accessible only by administrators.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all pictures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Picture'
 *       401:
 *         description: Not authorized to access this resource
 *       500:
 *         description: Server error
 */

router.get('/', AuthenticationService.isAuthenticated, async (req, res) => {
    try {
        if (req) {
            if (req.isAdministrator) {
                const pics = await PictureService.getAllPictures();
                res.status(200).json(Object.values(pics));
            } else {
                res.status(401).json({ "Error": "Not Authorized!" });
            }
        }
    } catch (err) {
    }
});

// Bild anzeigen lassen wenn der Url mit der id aufgerufen wird

/**
 * @swagger
 * /api/picture/{id}:
 *   get:
 *     tags:
 *       - Picture
 *     summary: Retrieves a specific picture by ID
 *     description: Provides a specific picture identified by ID. Accessible to all users.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the picture
 *     responses:
 *       200:
 *         description: Picture successfully retrieved
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Picture not found
 *       500:
 *         description: Server error
 */

router.get('/:id', async (req, res) => {
    if (req) {
        try {
            const picture = await PictureService.findPictureByID(req.params.id)
            if (picture) {
                res.contentType(picture.contentType);
                res.sendFile(picture.path, { root: './' })
            } else {
                res.status(404).json({ "Error": "Kein Bild mit dieser ID gefunden!" })
            }
        } catch (err) {
            res.status(404).json({ "Error": "Kein Bild mit dieser ID gefunden!" })
        }
    }
})

// Um Profilebild zu aktualisieren. Das alte Bild wenn existiert, wird gelöscht und ersetzt

/**
 * @swagger
 * /api/picture/uploadProfilePicture:
 *   post:
 *     tags:
 *       - Picture
 *     summary: Uploads a profile picture
 *     description: Allows authenticated users to upload a profile picture. Replaces any existing profile picture.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture successfully uploaded
 *       400:
 *         description: Invalid file format
 *       500:
 *         description: Server error
 */

router.post('/uploadProfilePicture', AuthenticationService.isAuthenticated, uploadProfilePicture.single('profilePic'), async (req, res) => {
    try {
        const img = req.file;
        const imgFormat = img.originalname.split('.').pop();
        if (imgFormat === "jpeg" || imgFormat === "jpg" || imgFormat === "png" || imgFormat === "jfif") {
            const picture = await PictureService.createPicture(img)
            if (picture) {
                const user = await UserService.findUserByID(req.id)
                if (user.profilePicture) {
                    const deletedPic = await PictureService.deletePicture(user.profilePicture)
                    if (deletedPic) {
                        unlink(deletedPic.path, (err) => {
                            if (err) throw err;
                        });
                    }
                }
                await UserService.updateProfilePicture(req.id, picture.id)
                res.status(200).json({ "Success": 'Bild erfolgreich hochgeladen!' });
            }
        } else {
            res.status(400).json({ "Error": 'Bitte Laden Sie Bilder mit den Folgenden Formaten hoch: Jpeg, Jpg, png, jfif' });
        }
    } catch (error) {
    }
});

// Um Post Bilder hochladen zu können. Post ID muss im Link eingegeben werden.

/**
 * @swagger
 * /api/picture/uploadPostPicture/{postID}:
 *   post:
 *     tags:
 *       - Picture
 *     summary: Uploads a picture for a forum post
 *     description: Allows authenticated users to upload a picture for a specific forum post. Replaces any existing post picture.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postID
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the forum post
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               postPic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post picture successfully uploaded
 *       400:
 *         description: Invalid file format
 *       500:
 *         description: Server error
 */

router.post('/uploadPostPicture/:postID', AuthenticationService.isAuthenticated, uploadPostPicture.single('postPic'), async (req, res) => {
    try {
        const postID = req.params.postID
        const img = req.file;
        const imgFormat = img.originalname.split('.').pop();
        if (imgFormat === "jpeg" || imgFormat === "jpg" || imgFormat === "png" || imgFormat === "jfif") {
            const picture = await PictureService.createPicture(img)
            if (picture) {
                const post = await ForumPostService.getPostById(postID);
                if (post.postPicture) {
                    const deletedPic = await PictureService.deletePicture(post.postPicture)
                    unlink(deletedPic.path, (err) => {
                        if (err) throw err;
                    });
                }
                await ForumPostService.updatePostPicture(postID, picture.id) 
                res.status(200).json({ "Success": 'Bild erfolgreich hochgeladen!' });
            }
        } else {
            res.status(400).json({ "Error": 'Bitte Laden Sie Bilder mit den Folgenden Formaten hoch: Jpeg, Jpg, png, jfif' });
        }
    } catch (error) {
    }
});

// Profilbild mit seinem id löschen, admins löschen Bilder von anderen Users, Users löschen Bilder von sich selbst

/**
 * @swagger
 * /api/picture/profilePicture/{id}:
 *   delete:
 *     tags:
 *       - Picture
 *     summary: Deletes a profile picture
 *     description: Allows administrators to delete any user's profile picture or users to delete their own profile picture.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the profile picture to be deleted
 *     responses:
 *       204:
 *         description: Profile picture successfully deleted
 *       401:
 *         description: Unauthorized, only administrators or the owning user can delete the profile picture
 *       404:
 *         description: Profile picture not found
 *       400:
 *         description: Error occurred
 */

router.delete('/profilePicture/:id', AuthenticationService.isAuthenticated, async (req, res) => {
    try {
        if (req) {
            const id = req.params.id
            if (req.isAdministrator) {
                const user = await UserService.findUserByProfilePic(id)
                await UserService.deleteProfilePicture(user.id)
                const deletedPic = await PictureService.deletePicture(id)
                if (deletedPic) {
                    unlink(deletedPic.path, (err) => {
                        if (err) throw err;
                    });
                    res.status(204).json()
                } else {
                    res.status(404).json({ "Error": "Bild nicht gefunden!" })
                }
            } else {
                await UserService.deleteProfilePicture(req.id)
                const deletedPic = await PictureService.deletePicture(id)
                if (deletedPic) {
                    unlink(deletedPic.path, (err) => {
                        if (err) throw err;
                    });
                    res.status(204).json()
                } else {
                    res.status(404).json({ "Error": "Bild nicht gefunden!" })
                }
            }
        }
    } catch (err) {
        res.status(400).json({ "Error": "Fehler ist aufgetreten" })
    }
});

// Postbild mit seinem id löschen, admins löschen Bilder von anderen Posts, Users löschen Bilder von deren Posts

/**
 * @swagger
 * /api/picture/postPicture/{postID}:
 *   delete:
 *     tags:
 *       - Picture
 *     summary: Deletes a post picture
 *     description: Allows administrators to delete any post picture or users to delete their own post picture.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postID
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the post whose picture is to be deleted
 *     responses:
 *       204:
 *         description: Post picture successfully deleted
 *       401:
 *         description: Unauthorized, only administrators or the owning user can delete the post picture
 *       404:
 *         description: Post picture not found
 *       400:
 *         description: Error occurred
 */

router.delete('/postPicture/:postID', AuthenticationService.isAuthenticated, async (req, res) => {
    try {
        if (req) {
            const postID = req.params.postID
            if (req.isAdministrator) {
                const post = await ForumPostService.getPostById(postID);
                if (post) {
                    await ForumPostService.deletePostPicture(postID)
                    const deletedPic = await PictureService.deletePicture(post.postPicture)
                    unlink(deletedPic.path, (err) => {
                        if (err) throw err;
                    });
                    res.status(204).json()
                } else {
                    res.status(404).json({ "Error": "Bild nicht gefunden!" })
                }
            } else {
                const post = await ForumPostService.getPostById(postID);
                if (post) {
                    if (post.user._id == req.id) {
                        const d = await ForumPostService.deletePostPicture(postID)
                        const deletedPic = await PictureService.deletePicture(post.postPicture)
                        unlink(deletedPic.path, (err) => {
                            if (err) throw err;
                        });
                        res.status(204).json()
                    } else {
                    res.status(401).json({ "Error": "Not Authorized" })
                }
                } else {
                    res.status(404).json({ "Error": "Bild nicht gefunden!" })
                }
            }
        }
    } catch (err) {
        res.status(400).json({ "Error": "Fehler ist aufgetreten" })
    }
});

module.exports = router;