const express = require('express');
const { param, body, validationResult, matchedData } = require('express-validator');
const { createPetPass, getPetPassesByCreator, updatePetPass, deletePetPass } = require("./PetPassService");
const { isAuthenticated } = require('../../authentication/AuthenticationService');
const PetPass = require('./PetPassModel')
const petPassRouter = express.Router();
const { createPicture, deletePicture } = require("../../picture/PictureService")
const fs = require('fs');
const { unlink } = fs;

/**
 * @swagger
 * components:
 *   schemas:
 *     PetPass:
 *       type: object
 *       properties:
 *         creator:
 *           type: string
 *           description: Reference to the user who created this pet pass
 *         picture:
 *           type: string
 *           description: URL or path to the pet's picture
 *         type:
 *           type: string
 *           description: The type of pet (e.g., dog, cat)
 *         name:
 *           type: string
 *           description: The name of the pet
 *         race:
 *           type: string
 *           description: The breed or race of the pet
 *         gender:
 *           type: string
 *           description: The gender of the pet
 *         age:
 *           type: number
 *           description: The age of the pet
 *           minimum: 0
 *           maximum: 99
 *         size:
 *           type: string
 *           description: The size category of the pet
 *         fur:
 *           type: string
 *           description: Description of the pet's fur
 *         personalities:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of strings describing the pet's personality
 *         diseases:
 *           type: string
 *           description: Description of any diseases the pet may have
 *         allergies:
 *           type: string
 *           description: Description of any allergies the pet may have
 *         houseTrained:
 *           type: boolean
 *           description: Boolean indicating if the pet is house trained
 *         sterilized:
 *           type: boolean
 *           description: Boolean indicating if the pet is sterilized
 *         vaccinated:
 *           type: boolean
 *           description: Boolean indicating if the pet is vaccinated
 *         chipped:
 *           type: boolean
 *           description: Boolean indicating if the pet has an identification chip
 */

/**
 * @swagger
 * tags:
 *   - name: PetPass
 *     description: Operations related to PetPasses
 *
 * /api/petpass/{id}:
 *   get:
 *     tags:
 *       - PetPass
 *     summary: Fetches pet passes by the creator's ID
 *     description: Retrieves all pet passes created by a user, identified by the user's MongoDB ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the pet pass creator
 *     responses:
 *       200:
 *         description: List of pet passes successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PetPass'
 *       400:
 *         description: Invalid request or validation error
 *       500:
 *         description: Server error
 */petPassRouter.get('/:id',
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.params.id;
            const petPasses = await getPetPassesByCreator(id);
            res.json(petPasses);
        } catch (err) {
            res.status(500);
            next(err);
        }
    });

    /**
 * @swagger
 * /api/petpass/:
 *   post:
 *     tags:
 *       - PetPass
 *     summary: Creates a new pet pass
 *     description: Allows authenticated users to create a new pet pass. Requires multipart/form-data for the picture upload.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               creator:
 *                 type: string
 *                 description: MongoDB ID of the user creating the pet pass
 *               type:
 *                 type: string
 *                 enum: [Hund, Katze]
 *                 description: Type of the pet (e.g., Hund, Katze)
 *               name:
 *                 type: string
 *               race:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [männlich, weiblich]
 *               age:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *               size:
 *                 type: string
 *                 enum: [klein, mittel, groß]
 *               fur:
 *                 type: string
 *               personalities:
 *                 type: array
 *                 items:
 *                   type: string
 *               diseases:
 *                 type: string
 *               allergies:
 *                 type: string
 *               houseTrained:
 *                 type: boolean
 *               sterilized:
 *                 type: boolean
 *               vaccinated:
 *                 type: boolean
 *               chipped:
 *                 type: boolean
 *               picture:
 *                 type: string
 *                 format: binary
 *                 description: Picture file for the pet pass
 *     responses:
 *       201:
 *         description: Pet pass successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetPass'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to perform this action
 *       500:
 *         description: Server error
 */

const multer = require('multer');
const upload = multer({ dest: './uploads/petpasspictures' });

petPassRouter.post('/', isAuthenticated, upload.single('picture'),
    body('creator').isMongoId(),
    body('type').isIn(['Hund', 'Katze']),
    body('name').isString(),
    body('race').isString(),
    body('gender').isIn(['männlich', 'weiblich']),
    body('age').isInt({ min: 1, max: 99 }),
    body('size').isIn(['klein', 'mittel', 'groß']),
    body('fur').isString(),
    body('personalities').toArray(),
    body('diseases').optional().isString(),
    body('allergies').optional().isString(),
    body('houseTrained').optional().isBoolean(),
    body('sterilized').optional().isBoolean(),
    body('vaccinated').optional().isBoolean(),
    body('chipped').optional().isBoolean(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const petPassData = matchedData(req);
            if (req.file) {
                const img = req.file;
                const pic = await createPicture(img);
                petPassData.picture = pic.id;
            }
            // Check if the user is authorized to create the pet pass
            if (req.id !== req.body.creator) {
                return res.status(403).send("Unauthorized!");
            }

            const petPass = await createPetPass(petPassData);
            res.status(201).json(petPass);
        } catch (err) {
            res.status(500);
            next(err);
        }
    });

/**
 * @swagger
 * /api/petpass/{id}:
 *   patch:
 *     tags:
 *       - PetPass
 *     summary: Updates an existing pet pass
 *     description: Allows authenticated users to update an existing pet pass. Supports multipart/form-data for picture upload.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the pet pass to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Hund, Katze]
 *               name:
 *                 type: string
 *               race:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [männlich, weiblich]
 *               age:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *               size:
 *                 type: string
 *                 enum: [klein, mittel, groß]
 *               fur:
 *                 type: string
 *               personalities:
 *                 type: array
 *                 items:
 *                   type: string
 *               diseases:
 *                 type: string
 *               allergies:
 *                 type: string
 *               houseTrained:
 *                 type: boolean
 *               sterilized:
 *                 type: boolean
 *               vaccinated:
 *                 type: boolean
 *               chipped:
 *                 type: boolean
 *               picture:
 *                 type: string
 *                 format: binary
 *                 description: New picture file for the pet pass
 *     responses:
 *       200:
 *         description: Pet pass successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetPass'
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to perform this action
 *       500:
 *         description: Server error
 */
petPassRouter.patch('/:id', isAuthenticated, upload.single('picture'),
    param('id').isMongoId(),
    body('type').optional().isIn(['Hund', 'Katze']),
    body('name').optional().isString(),
    body('race').optional().isString(),
    body('gender').optional().isIn(['männlich', 'weiblich']),
    body('age').optional().isInt({ min: 1, max: 99 }),
    body('size').optional().isIn(['klein', 'mittel', 'groß']),
    body('fur').optional().isString(),
    body('personalities').optional().toArray(),
    body('diseases').optional().isString(),
    body('allergies').optional().isString(),
    body('houseTrained').optional().isBoolean(),
    body('sterilized').optional().isBoolean(),
    body('vaccinated').optional().isBoolean(),
    body('chipped').optional().isBoolean(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.params.id
            const petPassData = matchedData(req);

            // Check if the pet pass exists and if the user is authorized to update it
            const petPassFound = await PetPass.findById(id);
            if (!petPassFound || petPassFound.creator.toString() !== req.id) {
                return res.status(403).send("Unauthorized!");
            }
            if (req.file) {
                const img = req.file;
                const newPic = await createPicture(img);

                if (petPassFound.picture) {
                    const deletedPic = await deletePicture(petPassFound.picture)
                    unlink(deletedPic.path, (err) => {
                        if (err) throw err;
                    });
                }
                petPassData.picture = newPic.id;
            }
            const petPass = await updatePetPass(id, petPassData);
            res.status(200).json(petPass);
        } catch (err) {
            res.status(500);
            next(err);
        }
    });

/**
 * @swagger
 * /api/petpass/{id}:
 *   delete:
 *     tags:
 *       - PetPass
 *     summary: Deletes an existing pet pass
 *     description: Allows authenticated users to delete an existing pet pass. The user must be the creator of the pet pass to delete it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the pet pass to be deleted
 *     responses:
 *       204:
 *         description: Pet pass successfully deleted
 *       400:
 *         description: Invalid request or validation error
 *       403:
 *         description: Unauthorized, user not allowed to perform this action
 *       500:
 *         description: Server error
 */petPassRouter.delete('/:id', isAuthenticated,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const id = req.params.id

            // Check if the pet pass exists and if the user is authorized to delete it
            const petPassFound = await PetPass.findById(id);
            if (!petPassFound || petPassFound.creator.toString() !== req.id) {
                return res.status(403).send("Unauthorized!");
            }
            if (petPassFound.picture) {
                const deletedPic = await deletePicture(petPassFound.picture)
                unlink(deletedPic.path, (err) => {
                    if (err) throw err;
                });
            }
            await deletePetPass(id);
            res.sendStatus(204);
        } catch (err) {
            res.status(500);
            next(err);
        }
    });

module.exports = petPassRouter;
