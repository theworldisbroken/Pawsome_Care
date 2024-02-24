const express = require('express')
const router = express.Router()

const UserService = require('../user/UserService')

/**
 * @swagger
 * /api/activation/{linkEnding}:
 *   get:
 *     tags:
 *       - ActivationLink
 *     summary: Activates a user account
 *     description: This route is used to activate a user's account using a unique link ending provided via email.
 *     parameters:
 *       - in: path
 *         name: linkEnding
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique ending of the activation link
 *     responses:
 *       200:
 *         description: Account successfully activated
 *       404:
 *         description: Activation link not available or invalid
 *       500:
 *         description: Server error
 */

router.get('/:linkEnding', async (req, res) => {
    if (req) {
        try {
            const activation = await UserService.updateVerifiedUser(req.params.linkEnding)
            if (activation) {
                res.status(200).json({ "Success": "Gratulation! Ihr Account wurde erfolgreich aktiviert!" })
            } else {
                res.status(404).json({ "Error": "Der Link ist nicht verfügbar!" })
            }
        } catch (err) {
            res.status(404).json({ "Error": "Der Link ist nicht verfügbar!" })
        }
    }
})

module.exports = router;