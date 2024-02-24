const Booking = require("../../endpoints/booking/BookingModel");
const User = require("../../endpoints/user/UserModel")
const Slot = require("../../endpoints/booking/SlotModel");
const PetPass = require("../../endpoints/userProfile/petPass/PetPassModel")

let john, bob;
const date = new Date(2023, 11, 31);
const time1 = "14:30";
const time2 = "14:45";
let slot1, slot2;
let petPass;

beforeEach(async () => {
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
    slot1 = await Slot.create({
        creator: john._id,
        date: date,
        time: time1
    });
    slot2 = await Slot.create({
        creator: john._id,
        date: date,
        time: time2
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
});

test("Create and retrieve Booking", async () => {
    let booking = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot1, slot2],
        date: date,
        startTime: time1,
        totalDuration: "00:30",
        totalPrice: 0,
        activities:[
            { activity: "gassi", weight: 60, duration: "00:15", price: 5 },
            { activity: "hausbesuch", weight: 40, duration: "00:15", price: 2 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: {address: "Berlin", lat: 51, lng: 10},
    });

    const bookingFound = await Booking.findById(booking._id)    
    .populate('bookedBy')
    .populate('bookedFrom')
    .populate('slots')
    .populate("petPasses");

    expect(bookingFound.bookedBy.email).toBe("bob@some-host.de");
    expect(bookingFound.bookedFrom.userID).toBe("john");
    expect(bookingFound.slots.length).toBe(2);
    expect(bookingFound.slots[0].time).toBe(time1);
    expect(bookingFound.slots[1].time).toBe(time2);
    expect(bookingFound.date.toISOString).toBe(date.toISOString);
    expect(bookingFound.startTime).toBe(time1);
    expect(bookingFound.totalDuration).toBe("00:30");
    expect(bookingFound.totalPrice).toBe(0);
    expect(bookingFound.activities.length).toBe(2);
    expect(bookingFound.activities[0].activity).toBe("gassi");
    expect(bookingFound.activities[0].weight).toBe(60);
    expect(bookingFound.activities[1].activity).toBe("hausbesuch");
    expect(bookingFound.activities[1].weight).toBe(40);  
    expect(bookingFound.petPasses[0].type).toBe("Hund");    
    expect(bookingFound.location.address).toBe("Berlin");
    expect(bookingFound.location.lat).toBe(51);
    expect(bookingFound.location.lng).toBe(10);

    expect(bookingFound.status).toBe("requested");
    expect(bookingFound.remarks).toBe("Hi!");
    expect(bookingFound.isNewCreator).toBe(true);
    expect(bookingFound.isNewProvider).toBe(true);

});

test("Update Booking", async () => {
    let booking = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot1, slot2],
        date: date,
        startTime: time1,
        totalDuration: "00:30",
        totalPrice: 0,
        activities:[
            { activity: "gassi", weight: 60, duration: "00:15", price: 5 },
            { activity: "hausbesuch", weight: 40, duration: "00:15", price: 2 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: {address: "Berlin", lat: 51, lng: 10},
    });

    await Booking.findByIdAndUpdate(booking._id, { 
        status: "requested",
    });

    const bookingUpdated = await Booking.findById(booking._id);
    expect(bookingUpdated.totalPrice).toBe(0);
    expect(bookingUpdated.status).toBe("requested");
});

test("Delete Booking", async () => {
    let booking = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot1, slot2],
        date: date,
        startTime: time1,
        totalDuration: "00:30",
        totalPrice: 0,
        activities:[
            { activity: "gassi", weight: 60, duration: "00:15", price: 5 },
            { activity: "hausbesuch", weight: 40, duration: "00:15", price: 2 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: {address: "Berlin", lat: 51, lng: 10},
    });

    await Booking.findByIdAndDelete(booking._id);

    const deletedBooking = await Booking.findById(booking._id);
    expect(deletedBooking).toBeNull();
});