const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const userRoute = require("./endpoints/user/UserRoute")
const authenticationRoute = require('./endpoints/authentication/AuthenticationRoute')
const slotRouter = require('./endpoints/booking/SlotRouter')
const userProfileRouter = require('./endpoints/userProfile/UserProfileRouter')
const reviewRouter = require('./endpoints/userProfile/review/ReviewRouter')
const petPassRouter = require('./endpoints/userProfile/petPass/PetPassRouter')
const bookingRouter = require('./endpoints/booking/BookingRouter')
const searchRouter = require('./endpoints/search/searchRouter')

const activationLinkRoute = require("./endpoints/activationLink/ActivationLinkRoute")
const pictureRoute = require('./endpoints/picture/PictureRoute')
const forumModel = require('./endpoints/forum/ForumModel')
const forumRouter = require('./endpoints/forum/ForumRouter')
const UserProfile = require("./endpoints/userProfile/UserProfileModel");

/* const startBookingsScheduler = require('./endpoints/booking/scheduler/BookingScheduler');
startBookingsScheduler(); */


const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');


const app = express()

app.use("*", cors())
app.use(bodyParser.json())

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0', 
        info: {
            title: 'API',
            version: '1.0.0',
            description: 'Dokumentation',
        },
        servers: [
            {
                url: 'http://localhost:80', 
            },
        ],
    },
    apis: ['./endpoints/**/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/api/users', userRoute)
app.use('/api/authenticate', authenticationRoute)
app.use('/api/slot', slotRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/activation', activationLinkRoute)
app.use('/api/pictures', pictureRoute)
app.use('/api/profile', userProfileRouter)
app.use('/api/review', reviewRouter)
app.use('/api/petpass', petPassRouter)
app.use('/api/search', searchRouter)
app.use('/api/forum/', forumRouter)

app.use(function (req, res) {
    res.status(404).json({ "Error": "Der Url existiert nicht!" })
})

app.use(function (err, req, res, next) {
    res.status(500).json({ "Error": err })
})

module.exports = app;