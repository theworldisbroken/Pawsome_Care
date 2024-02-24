const express = require('express')
const router = express.Router();

const authenticationService = require('./AuthenticationService')

// Durch diese Route, wird ein Login erfolgen, ein jwt token erzeugt und im response header hingelegt, womit wir alle andere Anfragen(requests) 
// nur mit dem Token durchführen können

/**
 * @swagger
 * /api/authentication/:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Generates a JWT token for user authentication
 *     description: This route authenticates a user and generates a JWT token, which is then used for authorizing subsequent API requests.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Basic authentication credentials (username and password)
 *     responses:
 *       200:
 *         description: Authentication successful, token created
 *         headers:
 *           Authorization:
 *             description: Bearer token for accessing protected routes
 *             schema:
 *               type: string
 *       401:
 *         description: Authentication failed, token not created
 *       500:
 *         description: Server error
 */

router.get('/', async function (req, res) {
    const authorization = req.headers.authorization
    if (authorization) {
        try {
            const { token, user } = await authenticationService.createToken(authorization);
            if (user) {
                if (token) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-A11ow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                    res.header("Access-Control-Allow-Credentials", "*");
                    res.header("Access-Control-Expose-Headers", "*");
                    res.header("Authorization", "Bearer " + token);
                    res.status(200).json({ "Success": "Token wude erfolgreich erstellt!" });
                }
            } else {
                res.status(401).json({ "Error": "Authentication ist fehlgeschlagen! Token kann nicht erstellt werden!" });
            }
        } catch (err) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-A11ow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Expose-Headers", "Authorization");
            res.status(401).json({ "Error": "Authetication ist fehlgeschlagen!" });
        }
    } else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-A11ow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Expose-Headers", "Authorization");
        res.status(401).json({ "Error": "Not Authorized" });
    }
});

module.exports = router;