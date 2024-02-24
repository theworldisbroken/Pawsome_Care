const supertest = require("supertest");
const app = require("../../../app");
const User = require("../../../endpoints/user/UserModel");
const Booking = require("../../../endpoints/booking/BookingModel")
const Slot = require("../../../endpoints/booking/SlotModel");
const PetPass = require("../../../endpoints/userProfile/petPass/PetPassModel")
const mongoose = require('mongoose');
const { createPost, createReview } = require("../../../endpoints/userProfile/review/ReviewService");



let john, bob, fred;
const ObjectId = mongoose.Types.ObjectId;
let booking, booking2, booking3, slot, petPass, post1, post2;
const date1 = new Date(2024, 11, 19);
const time1 = "14:15"

beforeEach(async () => {
    await User.syncIndexes()
    john = await User.create({
        userID: "John",
        email: "john@some-host.de",
        password: "P4SSW0RT!",
    });

    bob = await User.create({
        userID: "Bob",
        email: "bob@some-host.de",
        password: "P4SSW0RT!",
    });

    fred = await User.create({
        userID: "Fred",
        email: "fred@some-host.de",
        password: "P4SSW0RT!",
    });

    slot = await Slot.create({
        creator: john._id,
        date: date1,
        time: time1
    });

    petPass = await PetPass.create({
        creator: john._id,
        picture: "testPfad",
        type: "Hund",
        name: "Harry",
        race: "Dackel",
        gender: "männlich",
        age: 5,
        size: "mittel",
        fur: "kurz",
        personalities: ["verspielt", "liebevoll"]
    })

    booking = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot],
        date: date1,
        startTime: time1,
        totalDuration: "00:30",
        totalPrice: 0,
        activities: [
            { activity: "gassi", weight: 60, duration: "00:15", price: 5 },
            { activity: "hausbesuch", weight: 40, duration: "00:15", price: 2 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        status: "current",
        location: {address: "Berlin", lat: 51, lng: 10},
    });

    booking2 = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot],
        date: date1,
        startTime: time1,
        totalDuration: "00:30",
        totalPrice: 0,
        activities: [
            { activity: "gassi", weight: 60, duration: "00:15", price: 5 },
            { activity: "hausbesuch", weight: 40, duration: "00:15", price: 2 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        status: "current",
        location: {address: "Berlin", lat: 51, lng: 10},
    });


    booking3 = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot],
        date: date1,
        startTime: time1,
        totalDuration: "00:30",
        totalPrice: 0,
        activities: [
            { activity: "gassi", weight: 60, duration: "00:15", price: 5 },
            { activity: "hausbesuch", weight: 40, duration: "00:15", price: 2 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        status: "done",
        location: {address: "Berlin", lat: 51, lng: 10},
    });


    // Perform a login to get the token
    const loginResponse = await supertest(app)
        .get("/api/authenticate")
        .set('Authorization', 'Basic ' + Buffer.from("john@some-host.de:P4SSW0RT!").toString('base64'));

    token = loginResponse.headers['authorization']?.split(' ')[1];
    expect(token).toBeDefined();

    // Perform a second login to get the token
    const loginResponse2 = await supertest(app)
        .get("/api/authenticate")
        .set('Authorization', 'Basic ' + Buffer.from("bob@some-host.de:P4SSW0RT!").toString('base64'));

    token2 = loginResponse2.headers['authorization']?.split(' ')[1];
    expect(token2).toBeDefined();
});

test("GET /post/:id - Get posts for user", async () => {
    await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })

    await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hey",
        bookingID: booking._id,
        rating: 4
    })

    const response = await supertest(app)
        .get(`/api/review/${bob._id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].text).toBe("Hi");
    expect(response.body[0].creator.userID).toBe("john");
    expect(response.body[0].receiver.toString()).toBe(bob._id.toString());

});

test("GET /post/:id - Negativtest", async () => {
    const response = await supertest(app)
        .get(`/api/review/invalid-id`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("POST /post - Create a review", async () => {
    const response = await supertest(app)
        .post(`/api/review/`)
        .send({
            creator: john._id,
            receiver: bob._id,
            text: "Hey"
        })
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.text).toBe("Hey");
});

test("POST /post - 400", async () => {
    const response = await supertest(app)
        .post(`/api/review/`)
        .send({
            receiver: bob._id
        })
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("POST /post - 403", async () => {
    const response = await supertest(app)
        .post(`/api/review/`)
        .send({
            creator: john._id,
            receiver: bob._id,
            text: "Hey"
        })
        .set("Authorization", `Bearer ${token2}`);

    expect(response.statusCode).toBe(403);
});
 
test("POST /post/review - Create a review", async () => {
    const response = await supertest(app)
        .post(`/api/review/review`)
        .send({
            creator: john._id,
            receiver: bob._id,
            text: "Hey",
            bookingID: booking._id,
            rating: 3
        })
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.text).toBe("Hey");
});

test("POST /post/review - 400", async () => {
    const response = await supertest(app)
        .post(`/api/review/review`)
        .send({
            receiver: bob._id,
            text: "Hey",
            bookingID: booking._id,
            rating: 3        })
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("POST /post/review - 403", async () => {
    const response = await supertest(app)
        .post(`/api/review/review`)
        .send({
            creator: john._id,
            receiver: bob._id,
            text: "Hey",
            bookingID: booking._id,
            rating: 3
        })
        .set("Authorization", `Bearer ${token2}`);

    expect(response.statusCode).toBe(403);
});


test("PATCH /post/:id - Update a post", async () => {
    let review = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hey",
        bookingID: booking._id,
        rating: 4
    })

    const response = await supertest(app)
        .patch(`/api/review/${review._id}`)
        .send({
            creator: john._id,
            text: "Hey",
            rating: 5
        })
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.rating).toBe(5);
});

test("PATCH /post/:id 400", async () => {
    let review = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hey",
        bookingID: booking._id,
        rating: 4
    })

    const response = await supertest(app)
        .patch(`/api/review/${review._id}`)
        .send({
            text: "Hey",
            rating: 5
        })
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("PATCH /post/:id 403", async () => {
    let review = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hey",
        bookingID: booking._id,
        rating: 4
    })

    const response = await supertest(app)
        .patch(`/api/review/${review._id}`)
        .send({
            creator: john._id,
            text: "Hey",
            rating: 5
        })
        .set("Authorization", `Bearer ${token2}`);

    expect(response.statusCode).toBe(403);
});

test("PATCH /post/reply/:id - create a reply", async () => {
    let review = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hey",
        bookingID: booking._id,
        rating: 4
    })

    const response = await supertest(app)
        .patch(`/api/review/reply/${review._id}`)
        .send({
            creator: bob._id,
            text: "Hi",
        })
        .set("Authorization", `Bearer ${token2}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.reply.text).toBe("Hi");
});

test("PATCH /post/reply/:id - 400", async () => {
    let review = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hey",
        bookingID: booking._id,
        rating: 4
    })

    const response = await supertest(app)
        .patch(`/api/review/reply/${review._id}`)
        .send({
            text: "Hey",
            rating: 5
        })
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("PATCH /post/reply/:id - 403", async () => {
    let review = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hey",
        bookingID: booking._id,
        rating: 4
    })

    const response = await supertest(app)
        .patch(`/api/review/reply/${review._id}`)
        .send({
            creator: bob._id,
            text: "Hey",
            rating: 5
        })
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
});




test("DELETE /post/:id - Delete a review", async () => {
    let review = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hey",
        bookingID: booking._id,
        rating: 4
    })

    const response = await supertest(app)
        .delete(`/api/review/${review._id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
});

test("DELETE /post/:id - 400", async () => {
    const response = await supertest(app)
        .delete(`/api/review/invalid-id`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("DELETE /post/:id - 400", async () => {
    let review = await createReview({
        creator: john._id,
        receiver: fred._id,
        text: "Hey",
        bookingID: booking._id,
        rating: 4
    })

    const response = await supertest(app)
        .delete(`/api/review/${review._id}`)
        .set("Authorization", `Bearer ${token2}`);

    expect(response.statusCode).toBe(403);
});