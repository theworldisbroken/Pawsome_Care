const express = require("express");
const { body, matchedData, param, validationResult, query } = require('express-validator');
const { getSlots, deleteSlot, createSlot, manageSlots } = require("./SlotService");
const { isAuthenticated } = require("../authentication/AuthenticationService");
const slotRouter = express.Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Slot:
 *       type: object
 *       required:
 *         - creator
 *         - date
 *         - time
 *         - status
 *       properties:
 *         creator:
 *           type: string
 *           description: MongoDB ObjectId referencing the user who created the slot
 *         date:
 *           type: string
 *           format: date
 *           description: The date for the slot
 *         time:
 *           type: string
 *           pattern: '^([0-1]\\d|2[0-3]):([0-5]\\d)$'
 *           description: The specific time for the slot in HH:MM format
 *         status:
 *           type: string
 *           enum: [active, booked, requested]
 *           default: active
 *           description: The current status of the slot
 *         booking:
 *           type: string
 *           description: MongoDB ObjectId referencing a booking if the slot is booked; null if not booked
 */

/**
 * @swagger
 * tags:
 *   - name: Slot
 *     description: Operations related to Slots
 *
 * /api/slot/:
 *   get:
 *     tags:
 *       - Slot
 *     summary: Fetches slots based on query parameters
 *     description: Filters slots by creator, date, time, status, and booking fields. Supports multiple values for date and time.
 *     parameters:
 *       - in: query
 *         name: creator
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the slot creator
 *       - in: query
 *         name: date
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: date
 *         description: Array of ISO8601 dates to filter slots
 *       - in: query
 *         name: time
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             pattern: '^([0-1]\\d|2[0-3]):(00|15|30|45)$'
 *         description: Array of time slots to filter slots
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, requested, booked]
 *         description: Status of the slots to filter
 *       - in: query
 *         name: booking
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of a booking to filter slots
 *     responses:
 *       200:
 *         description: List of slots matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Invalid request or validation error
 *       500:
 *         description: Server error
 */

slotRouter.get("/",
    query('creator').optional().isMongoId(),
    query('date').optional().toArray(),
    query('date.*').optional().isISO8601(),
    query('time').optional().toArray(),
    query('time.*').optional().matches(/^([0-1]\d|2[0-3]):(00|15|30|45)$/),
    query('status').optional().isIn(['active', 'requested','booked']),
    query('booking').optional().isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const criteria = matchedData(req, { locations: ['query'] });
            const slots = await getSlots(criteria);
            res.json(slots);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * POST route to create a new slot.
 * Requires authentication.
 * Validates the body data for creator, dates, and times.
 */
slotRouter.post("/", isAuthenticated,
    body('creator').isMongoId(), 
    body('dates').isArray(), 
    body('dates.*').isISO8601(),
    body('times').isArray(),
    body('times.*').matches(/^([0-1]\d|2[0-3]):(00|15|30|45)$/),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const slotData = matchedData(req);
            if (req.id !== req.body.creator) {
                return res.status(403).send("Unauthorized!");
            }
            const slots = await createSlot(slotData);
            res.status(201).json(slots);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * DELETE route to remove a slot.
 * This route allows the deletion of a slot based on provided criteria.
 * Requires authentication.
 * Validates the body data for creator, dates, and times.
 */
slotRouter.delete("/", isAuthenticated,
body('creator').isMongoId(), 
body('dates').isArray(), 
body('dates.*').isISO8601(),
body('times').isArray(),
body('times.*').matches(/^([0-1]\d|2[0-3]):(00|15|30|45)$/),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const slotData = matchedData(req);
            if (req.id !== req.body.creator) {
                return res.status(403).send("Unauthorized!");
            }
            await deleteSlot(slotData);
            res.sendStatus(204); 
        } catch (err) {
            next(err);
        }
    }
);

/**
 * @swagger
 * /api/slot/manageSlots:
 *   post:
 *     tags:
 *       - Slot
 *     summary: Manages (creates or updates) slots
 *     description: Allows authenticated users to manage slots by specifying dates and times. The user must be the creator of the slots.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               creator:
 *                 type: string
 *                 description: MongoDB ObjectId of the user creating or updating the slots
 *               dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *                 description: Array of ISO8601 dates for the slots
 *               times:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^([0-1]\\d|2[0-3]):(00|15|30|45)$'
 *                 description: Array of time slots in HH:MM format
 *     responses:
 *       200:
 *         description: Slots successfully managed (created or updated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to perform this action
 *       500:
 *         description: Server error
 */

slotRouter.post("/manageSlots", isAuthenticated,
    body('creator').isMongoId(), 
    body('dates').isArray(), 
    body('dates.*').isISO8601(),
    body('times').isArray(),
    body('times.*').matches(/^([0-1]\d|2[0-3]):(00|15|30|45)$/),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const slotData = matchedData(req);
            if (req.id !== req.body.creator) {
                return res.status(403).send("Unauthorized");
            }
            const result = await manageSlots(slotData);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = slotRouter;
