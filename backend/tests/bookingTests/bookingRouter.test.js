const supertest = require("supertest");
const app = require("../../app");
const User = require("../../endpoints/user/UserModel")
const Booking = require("../../endpoints/booking/BookingModel");
const { updateUserProfile } = require("../../endpoints/userProfile/UserProfileService");
const mongoose = require('mongoose');
const Slot = require("../../endpoints/booking/SlotModel");
const PetPass = require("../../endpoints/userProfile/petPass/PetPassModel")


let john, bob, fred;
let booking;
let slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9;
let petPass;

const date1 = new Date(2024, 11, 19);
const date2 = new Date(2024, 11, 20);
const time1 = "14:15"
const time2 = "14:30"
const time3 = "14:45"
const time4 = "16:15"
const time5 = "16:30"
const ObjectId = mongoose.Types.ObjectId;

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

  await updateUserProfile(john._id, {
    aboutme: "hi",
    location: {address: "12345 Berlin, Deutschland"},
    dog: true,
    cat: false,
    gassi: { offered: true, price: 5 },
    tierarzt: { offered: true, price: 2 },
    training: { price: 3 },
    hausbesuch: { offered: true }

  })

  await updateUserProfile(bob._id, {
    aboutme: "hi",
    location: {address: "12345 Berlin, Deutschland"},
    dog: true,
    cat: false,
    gassi: { offered: true, price: 5 },
    tierarzt: { offered: true, price: 2 },
    training: { price: 3 },
    hausbesuch: { offered: true }

  })

  slot1 = await Slot.create({
    creator: bob._id,
    date: date1,
    time: time1
  });
  slot2 = await Slot.create({
    creator: bob._id,
    date: date1,
    time: time2
  });
  slot3 = await Slot.create({
    creator: john._id,
    date: date1,
    time: time2,
    status: "requested"
  });
  slot4 = await Slot.create({
    creator: john._id,
    date: date2,
    time: time2,
  });
  slot5 = await Slot.create({
    creator: bob._id,
    date: date1,
    time: time2,
  });
  slot6 = await Slot.create({
    creator: john._id,
    date: date1,
    time: time3,
  });
  slot7 = await Slot.create({
    creator: new ObjectId(),
    date: date1,
    time: time3,
  });
  slot8 = await Slot.create({
    creator: john._id,
    date: date2,
    time: time4
  });
  slot9 = await Slot.create({
    creator: john._id,
    date: date2,
    time: time5
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
    slots: [slot1, slot2],
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
    location: {address: "Berlin", lat: 51, lng: 10},
  });

  await Booking.create({
    bookedBy: bob._id,
    bookedFrom: fred._id,
    slots: [slot8, slot9],
    date: date1,
    startTime: time1,
    totalDuration: "00:45",
    totalPrice: 0,
    activities: [
      { activity: "gassi", weight: 60, duration: "00:15", price: 5 },
      { activity: "hausbesuch", weight: 40, duration: "00:15", price: 2 },
    ],
    petPasses: [petPass._id],
    remarks: "Hi!",
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
    .set('Authorization', 'Basic ' + Buffer.from("fred@some-host.de:P4SSW0RT!").toString('base64'));

  token2 = loginResponse2.headers['authorization']?.split(' ')[1];
  expect(token2).toBeDefined();
});



test("GET /booking ohne Kriterium", async () => {
  const response = await supertest(app)
    .get(`/api/booking`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(1);
});

test("GET /booking mit einem Kriterium", async () => {
  const response = await supertest(app)
    .get(`/api/booking/?bookedBy=${bob._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(1);
});

test("GET /booking mit mehreren Kriterium", async () => {
  const queryDate = encodeURIComponent(date1.toISOString());
  const response = await supertest(app)
    .get(`/api/booking/?bookedBy=${bob._id}&bookedFrom=${john._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(1);
});

test("GET /booking 500", async () => {
  const response = await supertest(app)
    .get(`/api/booking?bookedFrom=${fred._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(500);
});

test("GET /booking 400", async () => {
  const response = await supertest(app)
    .get(`/api/booking?bookedFrom=invalid-id`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("POST /booking", async () => {
  const response = await supertest(app)
    .post(`/api/booking`)
    .send({
      bookedBy: john._id,
      slots: [slot1._id, slot2._id],
      activities: [
        {activity: "gassi", weight: 100}],
      petPasses: [petPass._id],
      location: {address: "Berlin", lat: 51, lng: 10},

    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(201);
});

test("POST /booking mehrere Aktivitäten", async () => {
  const response = await supertest(app)
    .post(`/api/booking`)
    .send({
      bookedBy: john._id,
      slots: [slot1._id, slot2._id],
      activities: [
        { activity: "gassi", weight: 70 },
        { activity: "tierarzt", weight: 30 }],
      petPasses: [petPass._id],
      location: {address: "Berlin", lat: 51, lng: 10},
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(201);
});

test("POST /booking 400", async () => {
  const response = await supertest(app)
    .post(`/api/booking`)
    .send({
      slots: [slot1._id, slot2._id],
      activities: [
        { activity: "gassi", weight: 70 },
        { activity: "tierarzt", weight: 30 }],
      petPasses: [petPass._id],
      location: {address: "Berlin", lat: 51, lng: 10},
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("POST /booking 403", async () => {
  const response = await supertest(app)
    .post(`/api/booking`)
    .send({
      bookedBy: fred._id,
      slots: [slot1._id, slot2._id],
      activities: [
        { activity: "gassi", weight: 70 },
        { activity: "tierarzt", weight: 30 }],
      petPasses: [petPass._id],
      location: {address: "Berlin", lat: 51, lng: 10},
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(403);
});


test("PATCH /booking", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/${booking._id}`)
    .send({
      action: "accept"
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
});

test("PATCH /booking 400", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/id`)
    .send({
      action: "accept"
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("PATCH /booking 404", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/${john._id}`)
    .send({
      action: "accept"
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(404);
});

test("PATCH /booking 404", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/${booking._id}`)
    .send({
      action: "accept"
    })
    .set("Authorization", `Bearer ${token2}`);

  expect(response.statusCode).toBe(403);
});

test("PATCH /booking/isNew", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/isNew/${booking._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
});

test("PATCH /booking/isNew 400", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/isNew/id`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("PATCH /booking/isNew 404", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/isNew/${john._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(404);
});

test("PATCH /booking/isNew 403", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/isNew/${booking._id}`)
    .set("Authorization", `Bearer ${token2}`);

  expect(response.statusCode).toBe(403);
});

test("PATCH /booking/review", async () => {
  booking.status = "done";
  await booking.save()
  const response = await supertest(app)
    .patch(`/api/booking/review/${booking._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
});

test("PATCH /booking/review 400", async () => {
  booking.status = "done";
  await booking.save()
  const response = await supertest(app)
    .patch(`/api/booking/review/id`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("PATCH /booking/review 404", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/review/${john._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(404);
});

test("PATCH /booking/review 403", async () => {
  const response = await supertest(app)
    .patch(`/api/booking/review/${booking._id}`)
    .set("Authorization", `Bearer ${token2}`);

  expect(response.statusCode).toBe(403);
});
