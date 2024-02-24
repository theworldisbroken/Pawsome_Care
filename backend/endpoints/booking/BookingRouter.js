const express = require("express");
const { body, matchedData, param, validationResult, query } = require('express-validator');
const { getBookings, createBooking, manageBooking, updateIsNew, declineBookingReview } = require("./BookingService");
const { isAuthenticated } = require("../authentication/AuthenticationService");
const bookingRouter = express.Router();
const Booking = require('../booking/BookingModel');

/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       required:
 *         - activity
 *         - weight
 *         - duration
 *         - price
 *       properties:
 *         activity:
 *           type: string
 *           enum: [gassi, tierarzt, hausbesuch, herberge, training]
 *           description: Type of the activity
 *         weight:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Weight or importance of the activity
 *         duration:
 *           type: string
 *           pattern: '^([0-1]\\d|2[0-3]):([0-5]\\d)$'
 *           description: Duration of the activity in HH:MM format
 *         price:
 *           type: number
 *           description: Price of the activity
 *     Booking:
 *       type: object
 *       required:
 *         - bookedBy
 *         - bookedFrom
 *         - slots
 *         - date
 *         - startTime
 *         - totalDuration
 *         - totalPrice
 *         - activities
 *         - petPasses
 *         - location
 *       properties:
 *         bookedBy:
 *           type: string
 *           description: MongoDB ObjectId of the user who made the booking
 *         bookedFrom:
 *           type: string
 *           description: MongoDB ObjectId of the user offering the service
 *         slots:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of MongoDB ObjectIds for the time slots
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the booking
 *         startTime:
 *           type: string
 *           pattern: '^([0-1]\\d|2[0-3]):([0-5]\\d)$'
 *           description: Start time of the booking in HH:MM format
 *         endTime:
 *           type: string
 *           pattern: '^([0-1]\\d|2[0-3]):([0-5]\\d)$'
 *           description: End time of the booking in HH:MM format
 *         totalDuration:
 *           type: string
 *           pattern: '^(0\\d|1\\d|2[0-3]):(00|15|30|45)$'
 *           description: Total duration of the booking in HH:MM format
 *         totalPrice:
 *           type: number
 *           description: Total price for the booking
 *         activities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Activity'
 *           description: List of activities included in the booking
 *         petPasses:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of MongoDB ObjectIds for the pets involved in the booking
 *         remarks:
 *           type: string
 *           description: Optional remarks or special instructions for the booking
 *         status:
 *           type: string
 *           enum: [requested, accepted, declined, cancelled, current, done]
 *           default: requested
 *           description: Current status of the booking
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               description: Address of the booking location
 *             lat:
 *               type: number
 *               description: Latitude of the booking location
 *             lng:
 *               type: number
 *               description: Longitude of the booking location
 *         reviewCreator:
 *           type: boolean
 *           default: false
 *           description: Indicates if the creator has left a review
 *         reviewProvider:
 *           type: boolean
 *           default: false
 *           description: Indicates if the provider has left a review
 *         isNewCreator:
 *           type: boolean
 *           default: true
 *           description: Indicates if the creator is new to this service
 *         isNewProvider:
 *           type: boolean
 *           default: true
 *           description: Indicates if the provider is new to this service
 */


/**
 * @swagger
 * tags:
 *   - name: Booking
 *     description: Operations related to Bookings
 *
 * /api/booking/:
 *   get:
 *     tags:
 *       - Booking
 *     summary: Fetches bookings based on query parameters
 *     description: Retrieves bookings filtered by bookedBy, bookedFrom, and status fields. The user must be authenticated and involved in the booking either as a booker or a service provider.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookedBy
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user who made the booking
 *       - in: query
 *         name: bookedFrom
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user providing the service
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [requested, accepted, declined, withdrawn]
 *         description: Status of the bookings to filter
 *     responses:
 *       200:
 *         description: List of bookings matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid request or validation error
 *       500:
 *         description: Server error
 */

bookingRouter.get("/", isAuthenticated,
    query('bookedBy').optional().isMongoId(),
    query('bookedFrom').optional().isMongoId(),
    query('status').optional().isIn(['requested', 'accepted', 'declined', 'withdrawn']),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.id;

        try {
            const criteria = matchedData(req, { locations: ['query'] });
            criteria.$or = [{ bookedBy: userId }, { bookedFrom: userId }]; // Adding a condition to fetch bookings where the user is either the booker or the provider

            const bookings = await getBookings(criteria);
            res.json(bookings);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * @swagger
 * /api/booking/:
 *   post:
 *     tags:
 *       - Booking
 *     summary: Creates a new booking
 *     description: Allows authenticated users to create a new booking. Validates and requires data such as bookedBy, slots, activities, and petPasses.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookedBy
 *               - slots
 *               - activities
 *               - petPasses
 *               - location
 *             properties:
 *               bookedBy:
 *                 type: string
 *                 description: MongoDB ObjectId of the user who made the booking
 *               slots:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of MongoDB ObjectIds for the time slots
 *               activities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     activity:
 *                       type: string
 *                     weight:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                 description: List of activities included in the booking
 *               petPasses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of MongoDB ObjectIds for the pets involved in the booking
 *               remarks:
 *                 type: string
 *                 description: Optional remarks or special instructions for the booking
 *               location:
 *                 type: object
 *                 required:
 *                   - address
 *                   - lat
 *                   - lng
 *                 properties:
 *                   address:
 *                     type: string
 *                     description: Address of the booking location
 *                   lat:
 *                     type: number
 *                     description: Latitude of the booking location
 *                   lng:
 *                     type: number
 *                     description: Longitude of the booking location
 *     responses:
 *       201:
 *         description: Booking successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to create booking for others
 *       500:
 *         description: Server error
 */

bookingRouter.post("/", isAuthenticated,
    body('bookedBy').isMongoId(),
    body('slots').isArray(),
    body('slots.*').isMongoId(),
    body('activities').isArray(),
    body('activities.*.activity').isString(),
    body('activities.*.weight').isInt({ min: 0, max: 100 }),
    body('petPasses').isArray(),
    body('petPasses.*').isMongoId(),
    body('remarks').optional().isString(),
    body('location.address').isString().notEmpty(),
    body('location.lat').isFloat({ min: -90, max: 90 }),
    body('location.lng').isFloat({ min: -180, max: 180 }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.id;
        try {
            const bookingData = matchedData(req);

            if (req.body.bookedBy !== userId) {
                return res.status(403).json({ error: "Unauthorized to create booking for other users" });
            }

            const bookings = await createBooking(bookingData);
            res.status(201).json(bookings);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * @swagger
 * /api/booking/{id}:
 *   patch:
 *     tags:
 *       - Booking
 *     summary: Manages a booking
 *     description: Allows authenticated users to manage a booking by accepting, declining, or canceling it. Users can only manage bookings they are involved in.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ObjectId of the booking to be managed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, decline, cancel]
 *                 description: Action to be performed on the booking
 *     responses:
 *       200:
 *         description: Booking successfully managed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to manage this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */

bookingRouter.patch("/:id", isAuthenticated,
    param('id').isMongoId(),
    body('action').isIn(['accept', 'decline', 'cancel']),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id = req.params.id;
        try {
            const booking = await Booking.findById(id).populate('slots');
            if (!booking) {
                return res.status(404).json({ error: "Booking not found" });
            }

            if (req.id !== booking.bookedBy.toString() && req.id !== booking.bookedFrom.toString()) {
                return res.status(403).json({ error: "Unauthorized to manage this booking" });
            }
            const requestData = matchedData(req);
            console.log(requestData.action)
            const updatedBookings = await manageBooking(id, { userID: req.id, action: requestData.action });

            res.status(200).json(updatedBookings);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * @swagger
 * /api/booking/isNew/{id}:
 *   patch:
 *     tags:
 *       - Booking
 *     summary: Updates the isNew status of a booking
 *     description: Marks a booking as no longer new. Requires authentication and that the user is involved in the booking.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ObjectId of the booking to update
 *     responses:
 *       200:
 *         description: Booking's isNew status successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to update this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */

bookingRouter.patch("/isNew/:id", isAuthenticated,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id = req.params.id;
        try {
            const booking = await Booking.findById(id);
            if (!booking) {
                return res.status(404).json({ error: "Booking not found" });
            }

            if (req.id !== booking.bookedBy.toString() && req.id !== booking.bookedFrom.toString()) {
                return res.status(403).json({ error: "Unauthorized to manage this booking" });
            }
            const updatedBooking = await updateIsNew(id, req.id);

            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * @swagger
 * /api/booking/review/{id}:
 *   patch:
 *     tags:
 *       - Booking
 *     summary: Declines to review a booking
 *     description: Allows a user to decline to review a booking. Requires authentication and that the user is involved in the booking.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ObjectId of the booking to decline review
 *     responses:
 *       200:
 *         description: Booking review successfully declined
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to decline review for this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */

bookingRouter.patch("/review/:id", isAuthenticated,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id = req.params.id;
        try {
            const booking = await Booking.findById(id);
            if (!booking) {
                return res.status(404).json({ error: "Booking not found" });
            }

            if (req.id !== booking.bookedBy.toString() && req.id !== booking.bookedFrom.toString()) {
                return res.status(403).json({ error: "Unauthorized to manage this booking" });
            }
            const updatedBooking = await declineBookingReview(id, req.id);

            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = bookingRouter;
