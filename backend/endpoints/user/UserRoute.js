const express = require("express")
const router = express.Router()
const config = require("config")

const UserService = require('./UserService')
const AuthenticationService = require('../authentication/AuthenticationService')
const ActivationLinkService = require('../activationLink/ActivationLinkService')

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - userID
 *         - email
 *         - password
 *       properties:
 *         userID:
 *           type: string
 *           description: Unique identifier for the user, lowercase
 *         email:
 *           type: string
 *           description: Unique email address of the user, lowercase
 *         firstName:
 *           type: string
 *           description: First name of the user
 *         lastName:
 *           type: string
 *           description: Last name of the user
 *         password:
 *           type: string
 *           description: Hashed password of the user. Requires at least 8 characters and one uppercase letter
 *         isAdministrator:
 *           type: boolean
 *           default: false
 *           description: Indicates if the user has administrator privileges
 *         activationLinkEnding:
 *           type: string
 *           description: Part of the activation link sent to the user's email for account verification
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Indicates if the user's email address has been verified
 *         profilePicture:
 *           type: string
 *           description: URL or path to the user's profile picture
 *         last_logged_in:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the user's last login
 */


// Eine get route mit dem Linkende "/" oder auch ohne, die alle Users holen soll. Hier verwenden wir die Funktionen, die im Service erstellt worden sind

/**
 * @swagger
 * /api/user/:
 *   get:
 *     tags:
 *       - User
 *     summary: Retrieves all users
 *     description: Provides a list of all users. Accessible only by administrators.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized to access this resource
 *       500:
 *         description: Server error
 */

router.get('/', AuthenticationService.isAuthenticated, async (req, res) => {
    try {
        if (req) {
            if (req.isAdministrator) {
                const users = await UserService.getUsers();
                const resultUsers = users.map(function (item) {
                    return {
                        "id": item.id,
                        "userID": item.userID,
                        "firstName": item.firstName,
                        "lastName": item.lastName,
                        "email": item.email,
                        "isVerified": item.isVerified,
                        "isAdministrator": item.isAdministrator,
                        "verifiedIdentity": item.verifiedIdentity,
                        "activationLinkEnding": item.activationLinkEnding,
                        "profilePicture": item.profilePicture,
                        "last_logged_in": item.last_logged_in
                    }
                })
                res.status(200).json(Object.values(resultUsers));
            } else {
                res.status(401).json({ "Error": "Not Authorized" })
            }
        }
    } catch (err) {
        res.status(401).json({ "Error": "Not Authorized" })
    }
});

/**
 * @swagger
 * /api/user/user/{userID}:
 *   get:
 *     tags:
 *       - User
 *     summary: Retrieves a specific user by userID
 *     description: Provides details of a specific user identified by userID.
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the user
 *     responses:
 *       200:
 *         description: User details successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Not authorized to access this resource
 */

router.get('/user/:userID', async (req, res) => {
    try {
        const userID = req.params.userID;
        const user = await UserService.findUser(userID)
        if (user) {
            res.status(200).json({
                "id": user.id,
                "userID": user.userID,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "profilePicture": user.profilePicture,
                "last_logged_in": user.last_logged_in
            });
        } else {
            res.status(404).json({ "Error": "UserID wurde nicht gefunden!" })
        }
    } catch {
        res.status(401).json({ "Error": "Not Authorized" })
    }
});

// Eine get route mit einem flexiblen Linkende nach dem userID, verwendet diese Endung, um den Nutzer zu finden

/**
 * @swagger
 * /api/user/{userID}:
 *   get:
 *     tags:
 *       - User
 *     summary: Retrieves a user by userID
 *     description: Provides details of a user identified by userID. Accessible by the user themselves or an administrator.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the user
 *     responses:
 *       200:
 *         description: User details successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized to access this resource
 *       404:
 *         description: User not found
 */

router.get('/:userID', AuthenticationService.isAuthenticated, async (req, res) => {
    if ((req.isAdministrator === false && req.userID === req.params.userID) || req.isAdministrator === true) {
        try {
            const userID = req.params.userID;
            const user = await UserService.findUser(userID)
            if (user) {
                res.status(200).json({
                    "id": user.id,
                    "userID": user.userID,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "email": user.email,
                    "isVerified": user.isVerified,
                    "isAdministrator": user.isAdministrator,
                    "verifiedIdentity": user.verifiedIdentity,
                    "activationLinkEnding": user.activationLinkEnding,
                    "profilePicture": user.profilePicture,
                    "last_logged_in": user.last_logged_in
                });
            } else {
                res.status(404).json({ "Error": "UserID wurde nicht gefunden!" })
            }
        } catch {
            res.status(401).json({ "Error": "Not Authorized" })
        }
    } else {
        res.status(401).json({ "Error": "Not Authorized" })
    }
});

/**
 * @swagger
 * /api/user/:
 *   post:
 *     tags:
 *       - User
 *     summary: Creates a new user
 *     description: Registers a new user and sends an activation link to their email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User successfully created and activation link sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, missing or invalid data
 *       500:
 *         description: Server error
 */

router.post('/', async (req, res) => {
    try {
        if (req) {
            const linkEnding = ActivationLinkService.randomString();
            req.body.activationLinkEnding = linkEnding;
            const user = await UserService.createUser(req.body);
            if (user) {
                if (process.env.NODEMAILER_USER && process.env.NODEMAILER_PASS) {
                    const activationLink = config.FrontendUrl + linkEnding;
                    await ActivationLinkService.sendActivationslink(req.body.email, activationLink)
                }
                res.status(201).json({
                    "id": user.id,
                    "userID": user.userID,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "email": user.email,
                    "isVerified": user.isVerified,
                    "isAdministrator": user.isAdministrator,
                    "verifiedIdentity": user.verifiedIdentity,
                    "activationLinkEnding": user.activationLinkEnding,
                    "profilePicture": user.profilePicture
                });
            }
        }
    } catch (err) {
        if (req.body.userID && req.body.email) {
            if (!req.body.password) {
                res.status(400).json({ "Error": "password fehlt!" })
            } else {
                res.status(400).json({ "Error": "userID oder email existiert schon, bitte benutzen Sie einen anderen userID!" })
            }
        } else {
            res.status(400).json({ "Error": "userID oder email fehlt!" })
        }
    }
});

/**
 * @swagger
 * /api/user/{userID}:
 *   put:
 *     tags:
 *       - User
 *     summary: Updates a user's profile
 *     description: Allows a user to update their profile or an administrator to update any user's profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the user to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User profile successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, only the user or an administrator can perform this action
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.put('/:userID', AuthenticationService.isAuthenticated, async (req, res) => {
    if (req) {
        if (req.isAdministrator === false && req.userID === req.params.userID) {
            try {
                const userID = req.params.userID
                const user = await UserService.updateSelfUser(userID, req.body)
                if (user) {
                    res.status(200).json({
                        "id": user.id,
                        "userID": user.userID,
                        "firstName": user.firstName,
                        "lastName": user.lastName,
                        "email": user.email,
                        "isVerified": user.isVerified,
                        "isAdministrator": user.isAdministrator,
                        "verifiedIdentity": user.verifiedIdentity,
                        "activationLinkEnding": user.activationLinkEnding,
                        "profilePicture": user.profilePicture
                    });
                }
            } catch (err) {
                res.status(401).json({ "Error": "Not Authorized!" })
            }
        } else {
            try {
                if (req.isAdministrator) {
                    const userID = req.params.userID
                    const user = await UserService.updateUser(userID, req.body)
                    if (user) {
                        res.status(200).json({
                            "id": user.id,
                            "userID": user.userID,
                            "firstName": user.firstName,
                            "lastName": user.lastName,
                            "email": user.email,
                            "isVerified": user.isVerified,
                            "isAdministrator": user.isAdministrator,
                            "verifiedIdentity": user.verifiedIdentity,
                            "activationLinkEnding": user.activationLinkEnding,
                            "profilePicture": user.profilePicture
                        });
                    } else {
                        res.status(404).json({ "Error": "userID wurde nicht gefunden!" })
                    }
                } else {
                    res.status(401).json({ "Error": "Not Authorized!" })
                }
            } catch (err) {
                res.status(401).json({ "Error": "userID existiert schon" })
            }
        }
    }
});

/**
 * @swagger
 * /api/user/{userID}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Deletes a user's profile
 *     description: Allows an administrator to delete a user's profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the user to be deleted
 *     responses:
 *       204:
 *         description: User profile successfully deleted
 *       401:
 *         description: Unauthorized, only an administrator can perform this action
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.delete('/:userID', AuthenticationService.isAuthenticated, async (req, res) => {
    try {
        if (req) {
            if (req.isAdministrator) {
                const userID = req.params.userID
                const deletedUser = await UserService.deleteUser(userID)
                if (deletedUser) {
                    res.status(204).json()
                } else {
                    res.status(404).json({ "Error": "userID nicht gefunden!" })
                }
            } else {
                res.status(401).json({ "Error": "Nur Administrator darf User löschen!" })
            }
        }
    } catch (err) {
    }
});

module.exports = router;