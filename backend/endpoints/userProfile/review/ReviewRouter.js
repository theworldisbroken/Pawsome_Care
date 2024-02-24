const Review = require("./ReviewModel")
const express = require('express');
const { param, body, validationResult, matchedData } = require('express-validator');
const { getPostsByUser, createPost, createReview, updatePostOrReview, deletePostOrReview, createOrUpdateOrDeleteReply } = require("./ReviewService");
const reviewRouter = express.Router();
const { isAuthenticated } = require("../../authentication/AuthenticationService");

/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewReply:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           description: Content of the reply
 *       required:
 *         - text
 *     Review:
 *       type: object
 *       properties:
 *         creator:
 *           type: string
 *           description: Reference to the user who created the review
 *         receiver:
 *           type: string
 *           description: Reference to the user who is the subject of the review
 *         text:
 *           type: string
 *           description: Content of the review
 *         reply:
 *           $ref: '#/components/schemas/ReviewReply'
 *           description: A reply to the review
 *         booking:
 *           type: string
 *           description: Reference to a booking associated with the review
 *         rating:
 *           type: number
 *           description: Numerical rating given in the review
 *       required:
 *         - creator
 *         - receiver
 *         - text
 */

/**
 * @swagger
 * tags:
 *   - name: Review
 *     description: Operations related to Reviews
 *
 * /api/review/{id}:
 *   get:
 *     tags:
 *       - Review
 *     summary: Fetches reviews by a user's ID
 *     description: Retrieves all reviews associated with a user, identified by the user's MongoDB ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the user whose reviews are being fetched
 *     responses:
 *       200:
 *         description: List of reviews successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid request or validation error
 *       500:
 *         description: Server error
 */
reviewRouter.get('/:id',
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.params.id;
            const reviews = await getPostsByUser(id);
            res.json(reviews);
        } catch (err) {
            next(err);
        }
    });

/**
 * @swagger
 * /api/review/:
 *   post:
 *     tags:
 *       - Review
 *     summary: Creates a new post
 *     description: Allows authenticated users to create a new post. The user must be authenticated and match the 'creator' field.
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
 *                 description: MongoDB ID of the user creating the post
 *               receiver:
 *                 type: string
 *                 description: MongoDB ID of the user who is the subject of the post
 *               text:
 *                 type: string
 *                 description: Content of the post
 *     responses:
 *       201:
 *         description: Post successfully created
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
 */reviewRouter.post('/', isAuthenticated,
    body('creator').isMongoId(),
    body('receiver').isMongoId(),
    body('text').notEmpty(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const postData = matchedData(req);
            if (req.id !== req.body.creator) {
                return res.status(403).send("Unauthorized!");
            }
            const post = await createPost(postData);
            res.status(201).json(post);
        } catch (err) {
            next(err);
        }
    });

/**
 * @swagger
 * /api/review/review/:
 *   post:
 *     tags:
 *       - Review
 *     summary: Creates a new detailed review
 *     description: Allows authenticated users to create a new detailed review with a rating. The user must be authenticated and match the 'creator' field.
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
 *                 description: MongoDB ID of the user creating the review
 *               receiver:
 *                 type: string
 *                 description: MongoDB ID of the user who is the subject of the review
 *               text:
 *                 type: string
 *                 description: Content of the review
 *               bookingID:
 *                 type: string
 *                 description: MongoDB ID of the associated booking
 *               rating:
 *                 type: integer
 *                 description: Numerical rating given in the review
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Review successfully created
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
 */reviewRouter.post('/review/', isAuthenticated,
    body('creator').isMongoId(),
    body('receiver').isMongoId(),
    body('text').notEmpty(),
    body('bookingID').isMongoId(),
    body('rating').isInt({ min: 1, max: 5 }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const postData = matchedData(req);
            if (req.id !== req.body.creator) {
                return res.status(403).send("Unauthorized!");
            }
            const post = await createReview(postData);
            res.status(201).json(post);
        } catch (err) {
            next(err);
        }
    });

/**
 * @swagger
 * /api/review/{id}:
 *   patch:
 *     tags:
 *       - Review
 *     summary: Updates an existing review
 *     description: Allows authenticated users to update an existing review. The user must be the creator of the review.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the review to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Updated content of the review
 *               rating:
 *                 type: integer
 *                 description: Updated numerical rating for the review
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Review successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to perform this action
 *       500:
 *         description: Server error
 */reviewRouter.patch('/:id', isAuthenticated,
    param('id').isMongoId(),
    body('creator').isMongoId(),
    body('text').optional().notEmpty(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.params.id
            const postData = matchedData(req);
            const postFound = await Review.findById(id);
            if (!postFound || postFound.creator.toString() !== req.id) {
                return res.status(403).send("Unauthorized!");
            }
            const post = await updatePostOrReview(id, postData);
            res.status(200).json(post);
        } catch (err) {
            next(err);
        }
    });

/**
 * @swagger
 * /api/review/reply/{id}:
 *   patch:
 *     tags:
 *       - Review
 *     summary: Creates, updates, or deletes a reply to a review
 *     description: Allows authenticated users to create, update, or delete a reply to a review. The user must be the receiver of the review to reply.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the review to reply to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Content of the reply
 *     responses:
 *       200:
 *         description: Reply to review successfully created, updated, or deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to perform this action
 *       500:
 *         description: Server error
 */reviewRouter.patch('/reply/:id', isAuthenticated,
    param('id').isMongoId(),
    body('creator').isMongoId(),
    body('text').optional().notEmpty(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.params.id
            const replyData = matchedData(req);
            const postFound = await Review.findById(id);
            if (!postFound || postFound.receiver.toString() !== req.id) {
                return res.status(403).send("Unauthorized!");
            }
            const post = await createOrUpdateOrDeleteReply(id, replyData);
            res.status(200).json(post);
        } catch (err) {
            next(err);
        }
    });

/**
 * @swagger
 * /api/review/{id}:
 *   delete:
 *     tags:
 *       - Review
 *     summary: Deletes an existing review
 *     description: Allows authenticated users to delete an existing review. The user must be either the creator or the receiver of the review.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the review to be deleted
 *     responses:
 *       204:
 *         description: Review successfully deleted
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to perform this action
 *       500:
 *         description: Server error
 */reviewRouter.delete('/:id', isAuthenticated,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.params.id;
            const postFound = await Review.findById(id);
            if (!postFound ||
                (postFound.creator.toString() !== req.id &&
                    postFound.receiver.toString() !== req.id)) {
                return res.status(403).send("Unauthorized!");
            }
            await deletePostOrReview(id, req.id);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    });

module.exports = reviewRouter;
