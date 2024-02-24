const supertest = require("supertest");
const app = require("../../app"); 
const User = require("../../endpoints/user/UserModel")
const Slot = require("../../endpoints/booking/SlotModel");


let token, token2;
let john;
let bob;
const date1 = new Date(2027, 11, 29);
const date2 = new Date(2027, 11, 30);

const time1 = "14:15"
const time2 = "14:30"
const time3 = "17:15"
const time4 = "17:30"
beforeEach(async () => {
    // Create users and slots for testing
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
    await Slot.create({
      creator: john._id,
      date: date1,
      time: time1
    });
    await Slot.create({
      creator: john._id,
      date: date1,
      time: time2
    });
    await Slot.create({
      creator: john._id,
      date: date2,
      time: time1
    });
    await Slot.create({
      creator: john._id,
      date: date2,
      time: time2
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



test("GET /slots ohne Kriterium", async () => {
  const response = await supertest(app)
    .get(`/api/slot`)
    .set("Authorization", `Bearer ${token}`);
  
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(4);

  const slotResponse0 = response.body[0];
  expect(slotResponse0.creator).toBe(john._id.toString());
  expect(new Date(slotResponse0.date)).toEqual(date1);
  expect(slotResponse0.time).toBe(time1);

  const slotResponse1 = response.body[1];
  expect(slotResponse1.creator).toBe(john._id.toString());
  expect(new Date(slotResponse1.date)).toEqual(date1);
  expect(slotResponse1.time).toBe(time2);

  const slotResponse2 = response.body[2];
  expect(slotResponse2.creator).toBe(john._id.toString());
  expect(new Date(slotResponse2.date)).toEqual(date2);
  expect(slotResponse2.time).toBe(time1);

  const slotResponse3 = response.body[3];
  expect(slotResponse3.creator).toBe(john._id.toString());
  expect(new Date(slotResponse3.date)).toEqual(date2);
  expect(slotResponse3.time).toBe(time2);

});

test("GET /slot mit einem Kriterium", async () => {
  const queryDate = encodeURIComponent(date1.toISOString());
  const response = await supertest(app)
    .get(`/api/slot/?date=${queryDate}`)
    .set("Authorization", `Bearer ${token}`);
  
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(2);
});

test("GET /slot mit mehreren Kriterium", async () => {
  const queryDate = encodeURIComponent(date1.toISOString());
  const response = await supertest(app)
    .get(`/api/slot/?date=${queryDate}&time=${time1}`)
    .set("Authorization", `Bearer ${token}`);
  
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(1);
});

test("GET /slot Negativtest", async () => {
  const response = await supertest(app)
    .get(`/api/slot?creator=invalidID`)
    .set("Authorization", `Bearer ${token}`);
  
  expect(response.statusCode).toBe(400);
});


test("POST /slot mehrere Zeiten", async () => {
  const response = await supertest(app)
    .post(`/api/slot`)
    .send({
      creator: john._id,
      dates: [date1, date2],
      times: [time3, time4]
    })
    .set("Authorization", `Bearer ${token}`);
  
    expect(response.statusCode).toBe(201);
    expect(response.body.length).toBe(4);
});

test("POST /slot eine Zeit", async () => {
  const response = await supertest(app)
    .post(`/api/slot`)
    .send({
      creator: john._id,
      dates: [date1],
      times: [time3]
    })
    .set("Authorization", `Bearer ${token}`);
  
    expect(response.statusCode).toBe(201);
    expect(response.body.length).toBe(1);
});

test("POST /slot Negativtest", async () => {
  const response = await supertest(app)
    .post(`/api/slot`)
    .send({
      creator: john._id,
      dates: date1
    })
    .set("Authorization", `Bearer ${token}`);
  
    expect(response.statusCode).toBe(400);
});

test("POST /slot eine Zeit 403", async () => {
  const response = await supertest(app)
    .post(`/api/slot`)
    .send({
      creator: john._id,
      dates: [date1],
      times: [time3]
    })
    .set("Authorization", `Bearer ${token2}`);
  
    expect(response.statusCode).toBe(403);
});

test("DELETE /slot ", async () => {
  const response = await supertest(app)
    .delete(`/api/slot`)
    .send({
      creator: john._id,
      dates: [date1],
      times: [time2]
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(204);
});

test("DELETE /slot Negativtest", async () => {
  const queryDate = date2.toISOString();
  const response = await supertest(app)
    .delete(`/api/slot/?creator=invalidID&dates[]=${encodeURIComponent(queryDate)}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("DELETE /slot 403", async () => {
  const response = await supertest(app)
    .delete(`/api/slot`)
    .send({
      creator: john._id,
      dates: [date1],
      times: [time2]
    })
    .set("Authorization", `Bearer ${token2}`);

  expect(response.statusCode).toBe(403);
});


test("POST /manageSlots mehrere Zeiten", async () => {
  const response = await supertest(app)
    .post(`/api/slot/manageSlots`)
    .send({
      creator: john._id,
      dates: [date1, date2],
      times: [time3, time4]
    })
    .set("Authorization", `Bearer ${token}`);
  
    expect(response.statusCode).toBe(200);
    expect(response.body.created).toBe(4);

    const response2 = await supertest(app)
    .post(`/api/slot/manageSlots`)
    .send({
      creator: john._id,
      dates: [date1, date2],
      times: [time3, time4]
    })
    .set("Authorization", `Bearer ${token}`);
  
    expect(response2.statusCode).toBe(200);
    expect(response2.body.deleted).toBe(4);
});

test("POST /manageSlots 403", async () => {
  const response = await supertest(app)
    .post(`/api/slot/manageSlots`)
    .send({
      creator: john._id,
      dates: [date1, date2],
      times: [time3, time4]
    })
    .set("Authorization", `Bearer ${token2}`);
  
    expect(response.statusCode).toBe(403);
});

test("POST /manageSlots 400", async () => {
  const response = await supertest(app)
    .post(`/api/slot/manageSlots`)
    .send({
      creator: john._id,
      times: [time3, time4]
    })
    .set("Authorization", `Bearer ${token}`);
  
    expect(response.statusCode).toBe(400);
});