const express = require("express");
const { body, matchedData, param, validationResult, query } = require('express-validator');
const { getUserProfile, updateUserProfile, toggleFavorite } = require("./UserProfileService");
const { isAuthenticated } = require("../authentication/AuthenticationService");
const { findUser } = require("../user/UserService");
const userProfileRouter = express.Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         user:
 *           type: string
 *           description: Reference to the User model
 *         aboutme:
 *           type: string
 *           description: About me section of the user profile
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               description: Type of the geo point, defaults to 'Point'
 *               enum: ['Point']
 *             coordinates:
 *               type: array
 *               description: User's geocoordinates (longitude and latitude)
 *               items:
 *                 type: number
 *             address:
 *               type: string
 *               description: Address of the user
 *         dog:
 *           type: boolean
 *           description: Indicates whether the user can accommodate dogs
 *         cat:
 *           type: boolean
 *           description: Indicates whether the user can accommodate cats
 *         hausbesuch:
 *           $ref: '#/components/schemas/Activity'
 *         gassi:
 *           $ref: '#/components/schemas/Activity'
 *         training:
 *           $ref: '#/components/schemas/Activity'
 *         herberge:
 *           $ref: '#/components/schemas/Activity'
 *         tierarzt:
 *           $ref: '#/components/schemas/Activity'
 *         ratingAverage:
 *           type: number
 *           description: Average rating of the user based on user reviews
 *           minimum: 0
 *           maximum: 5
 *         ratingCount:
 *           type: number
 *           description: Total number of ratings received by the user
 *           minimum: 0
 *         favorites:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of User IDs who have marked this user as a favorite
 *         favoritedBy:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of User IDs who have been marked as a favorite by this user
 *     Activity:
 *       type: object
 *       properties:
 *         offered:
 *           type: boolean
 *           description: Indicates whether the activity is offered
 *         price:
 *           type: number
 *           description: Price of the activity
 */


/**
  * @swagger
 * tags:
 *   - name: UserProfile
 *     description: Operations related to User Profiles
 *
 * /api/profile/{id}:
 *   get:
 *     tags:
 *       - UserProfile
 *     summary: Retrieves a user profile by ID
 *     description: Provides the user profile for the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the user profile
 *     responses:
 *       200:
 *         description: User profile successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User profile not found
 */
userProfileRouter.get("/:id",
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.params.id;
            const userProfile = await getUserProfile(id);
            res.json(userProfile);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * @swagger
 * /api/profile/patch/{id}:
 *   patch:
 *     tags:
 *       - UserProfile
 *     summary: Updates a user profile
 *     description: Updates the user profile for the specified ID. User authentication is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the user profile to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aboutme:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                   address:
 *                     type: string
 *               dog:
 *                 type: boolean
 *               cat:
 *                 type: boolean
 *               hausbesuch:
 *                 type: object
 *                 properties:
 *                   offered:
 *                     type: boolean
 *                   price:
 *                     type: number
 *               gassi:
 *                 type: object
 *                 properties:
 *                   offered:
 *                     type: boolean
 *                   price:
 *                     type: number
 *               training:
 *                 type: object
 *                 properties:
 *                   offered:
 *                     type: boolean
 *                   price:
 *                     type: number
 *               herberge:
 *                 type: object
 *                 properties:
 *                   offered:
 *                     type: boolean
 *                   price:
 *                     type: number
 *               tierarzt:
 *                 type: object
 *                 properties:
 *                   offered:
 *                     type: boolean
 *                   price:
 *                     type: number
 *     responses:
 *       200:
 *         description: User profile successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized access or user is not allowed to update this profile
 *       500:
 *         description: Server error
 */

const addressRegex = /^\d{5}\s[a-zA-ZäöüßÄÖÜ .-]+$/;

userProfileRouter.patch("/patch/:id", isAuthenticated,
    param('id').isMongoId(),
    body('aboutme').optional().isString(),
    body('location.coordinates').optional().isArray({ min: 2, max: 2 }),
    body('location.coordinates.*').optional().isFloat({ min: -180, max: 180 }),
    body('location.address').optional({ nullable: true }).custom(value => {
        return value === null || value === "" || addressRegex.test(value);
    }),
    body('dog').optional().isBoolean(),
    body('cat').optional().isBoolean(),
    body('hausbesuch.offered').optional().isBoolean(),
    body('hausbesuch.price').optional().isFloat({ min: 0, max: 100 }),
    body('gassi.offered').optional().isBoolean(),
    body('gassi.price').optional().isFloat({ min: 0, max: 100 }),
    body('training.offered').optional().isBoolean(),
    body('training.price').optional().isFloat({ min: 0, max: 100 }),
    body('herberge.offered').optional().isBoolean(),
    body('herberge.price').optional().isFloat({ min: 0, max: 100 }),
    body('tierarzt.offered').optional().isBoolean(),
    body('tierarzt.price').optional().isFloat({ min: 0, max: 100 }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.params.id;
            const userProfileData = matchedData(req);
            if (req.body.location && req.body.location.address === null) {
                if (!userProfileData.location) {
                    userProfileData.location = {};
                }
                userProfileData.location.address = null;
            }
            if (req.id !== id) {
                return res.status(403).send("Unauthorized!");
            }
            const updatedUserProfile = await updateUserProfile(id, userProfileData);
            res.status(200).json(updatedUserProfile);
        } catch (err) {
            next(err);
        }
    }
);


/**
 * @swagger
 * /api/profile/toggle:
 *   patch:
 *     tags:
 *       - UserProfile 
 *     summary: Toggles the favorite status of a user profile
 *     description: Allows authenticated users to add or remove another user from their list of favorites. It requires user authentication and validates both the userID of the user performing the action and the favoriteID of the user to be toggled as a favorite. The route ensures that the action can only be performed by the authenticated user on their own profile.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: MongoDB ID of the user performing the action
 *               favoriteID:
 *                 type: string
 *                 description: MongoDB ID of the user to be toggled as a favorite
 *     responses:
 *       200:
 *         description: Favorite status successfully toggled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to perform this action
 *       500:
 *         description: Server error
 */
userProfileRouter.patch("/toggle", isAuthenticated,
    body('userID').isMongoId(),
    body('favoriteID').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.body.userID;
            const { userID, favoriteID } = matchedData(req);
            if (req.id !== id) {
                return res.status(403).send("Unauthorized!");
            }
            const updatedUserProfile = await toggleFavorite(userID, favoriteID);
            res.status(200).json(updatedUserProfile);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = userProfileRouter;