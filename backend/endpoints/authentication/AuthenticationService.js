const UserService = require('../user/UserService')
const jwt = require('jsonwebtoken')
const config = require("config");
const atob = require("atob")

// Eine Funktion, die die Credentials als Parameter weitergegeben wird und das Password vergleicht und schleßlich ein JWL Token erzeugt
async function createToken(userData) {
    if (userData) {
        const base64Decode = atob(userData.split(" ")[1])
        const headerData = base64Decode.split(":")
        const userIDOrEmail = headerData[0]
        const password = headerData[1]
        try {
            let user;
            if (userIDOrEmail.includes('@')) {
                user = await UserService.findUserByEmail(userIDOrEmail)
            } else {
                user = await UserService.findUser(userIDOrEmail);
            }
            if (user) {
                const isMatch = await user.comparePassword(password);
                if (isMatch) {
                    const currentDate = new Date();
                    await UserService.updateUser(user.userID, { "last_logged_in": currentDate })
                    const issuedAt = new Date().getTime();
                    const expirationTime = config.session.timeout;
                    const expresAt = issuedAt + expirationTime;
                    const privateKey = config.session.privateKey;
                    const token = jwt.sign(
                        {
                            id: user.id, userID: user.userID, isAdministrator: user.isAdministrator, isVerified: user.isVerified
                        },
                        privateKey,
                        { expiresIn: expresAt, algorithm: "HS256" }
                    );
                    return { token, user };
                }
            }
        } catch (err) {
            return null;
        }
    }
}

// Eine Funktion, die in Routes als Middleware funciton verwendet wird, um die Validierung des JWT Token zu checken und andere Infos im req und res zurückzugeben
function isAuthenticated(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization.split(" ")[1];
        const tokenInfo = jwt.decode(token)
        req.id = tokenInfo.id;
        req.userID = tokenInfo.userID;
        req.isAdministrator = tokenInfo.isAdministrator;
        req.isVerified = tokenInfo.isVerified;
        const privateKey = config.session.privateKey;
        jwt.verify(token, privateKey, { algorithm: "HS256" }, (err) => {
            if (err) {
                res.status(401).json({ "Error": "Not Authorized" });
                return;
            }
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-A11ow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Credentials", "*");
            res.header("Access-Control-Expose-Headers", "*");
            res.header("Authorization", req.headers.authorization);
            return next();
        });
    } else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-A11ow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Expose-Headers", "Authorization");
        res.status(401).json({ "Error": "Not Authorized" });
        return;
    }
}

module.exports = {
    createToken,
    isAuthenticated,
}