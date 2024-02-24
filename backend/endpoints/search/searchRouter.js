const express = require("express");
const { getFilteredProfiles } = require('./searchService')
const { matchedData, validationResult, query } = require('express-validator');
const searchRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Search
 *     description: Operations related to Search functionality
 *
 * /api/search/:
 *   get:
 *     tags:
 *       - Search
 *     summary: Searches user profiles based on various criteria
 *     description: Provides a list of user profiles based on search criteria like services, pets, dates, times, and location. Supports pagination and sorting.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of profiles per page
 *       - in: query
 *         name: services
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [gassi, hausbesuch, training, tierarzt, herberge]
 *         description: Array of services to filter profiles
 *       - in: query
 *         name: pets
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [dog, cat]
 *         description: Array of pet types to filter profiles
 *       - in: query
 *         name: dates
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: date-time
 *         description: Array of ISO8601 dates to filter profiles
 *       - in: query
 *         name: times
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             pattern: '^([0-1]\\d|2[0-3]):(00|15|30|45)$'
 *         description: Array of time slots to filter profiles
 *       - in: query
 *         name: centerLat
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of the center point for location-based search
 *       - in: query
 *         name: centerLng
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of the center point for location-based search
 *       - in: query
 *         name: topLeftLat
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of the top left point for location-based search
 *       - in: query
 *         name: topLeftLng
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of the top left point for location-based search
 *       - in: query
 *         name: bottomRightLat
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of the bottom right point for location-based search
 *       - in: query
 *         name: bottomRightLng
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of the bottom right point for location-based search
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [distance, rating, active, popularity]
 *         description: Sorting option for the results
 *     responses:
 *       200:
 *         description: List of user profiles matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid request or validation error
 *       500:
 *         description: Server error
 */


searchRouter.get('/',
    // Validate and sanitize query parameters
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 }),
    query('services').optional().toArray(),
    query('services.*').optional().isIn(['gassi', 'hausbesuch', 'training', 'tierarzt', 'herberge']),
    query('pets').optional().toArray(),
    query('pets.*').optional().isIn(['dog', 'cat']),
    query('dates').optional().toArray(),
    query('dates.*').optional().isISO8601(),
    query('times').optional().toArray(),
    query('times.*').optional().matches(/^([0-1]\d|2[0-3]):(00|15|30|45)$/),
    query('centerLat').optional().isFloat({ min: -90, max: 90 }),
    query('centerLng').optional().isFloat({ min: -180, max: 180 }),
    query('topLeftLat').optional().isFloat({ min: -90, max: 90 }),
    query('topLeftLng').optional().isFloat({ min: -180, max: 180 }),
    query('bottomRightLat').optional().isFloat({ min: -90, max: 90 }),
    query('bottomRightLng').optional().isFloat({ min: -180, max: 180 }),
    query('sort').optional().isIn(['distance', 'rating', 'active', 'popularity']),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract validated data from the request
        const validData = matchedData(req);
        const { page, limit, services, pets, dates, times, centerLat, centerLng, topLeftLat, topLeftLng, bottomRightLat, bottomRightLng, sort } = validData;

        // Parsing page and limit values, providing default values if not specified
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 30;

        // Constructing filter object based on the validated data
        const filter = {};
        if (services) filter.services = services;
        if (pets) filter.pets = pets;
        if (dates) filter.dates = dates;
        if (times) filter.times = times;
        if (centerLat && centerLng && topLeftLat && topLeftLng && bottomRightLat && bottomRightLng) filter.location = {
            center: { lat: centerLat, lng: centerLng },
            topLeft: { lat: topLeftLat, lng: topLeftLng },
            bottomRight: { lat: bottomRightLat, lng: bottomRightLng }
        };

        try {
            const profiles = await getFilteredProfiles({ page: pageNum, limit: limitNum, filter, sortOption: sort });
            res.json(profiles);
        } catch (err) { 
            next(err);
        }
    });

module.exports = searchRouter;
