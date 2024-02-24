const Booking = require("../../endpoints/booking/BookingModel");
const Slot = require("../../endpoints/booking/SlotModel");

const { getBookings, createBooking, manageBooking, updateIsNew, declineBookingReview } = require("../../endpoints/booking/BookingService");
const User = require("../../endpoints/user/UserModel")
const { getUserProfile, updateUserProfile } = require("../../endpoints/userProfile/UserProfileService");

const UserProfile = require("../../endpoints/userProfile/UserProfileModel")
const PetPass = require("../../endpoints/userProfile/petPass/PetPassModel")


const mongoose = require('mongoose');

let john, bob, fred;
let petPass, petPass2, petPass3, petPass4, petPass5, petPass6;

let slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9, slot10, slot11;

const date1 = new Date(2023, 11, 19);
const date2 = new Date(2024, 11, 20);
const time1 = "14:15"
const time2 = "14:30"
const time3 = "14:45"
const time4 = "16:15"
const time5 = "16:30"
const time6 = "23:45"
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
        location: { address: "12345 Berlin, Deutschland" },
        dog: true,
        cat: false,
        gassi: { offered: true, price: 5 },
        tierarzt: { offered: true, price: 2 },
        training: { price: 3 },
        hausbesuch: { offered: true }

    })

    slot1 = await Slot.create({
        creator: john._id,
        date: date1,
        time: time1
    });
    slot2 = await Slot.create({
        creator: john._id,
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
        creator: fred._id,
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
    slot10 = await Slot.create({
        creator: bob._id,
        date: date1,
        time: time2,
    });
    slot11 = await Slot.create({
        creator: john._id,
        date: date1,
        time: time6,
    });

    petPass = await PetPass.create({
        creator: bob._id,
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
    petPass2 = await PetPass.create({
        creator: bob._id,
        picture: "testPfad",
        type: "Katze",
        name: "Harry",
        race: "Dackel",
        gender: "männlich",
        age: 5,
        size: "mittel",
        fur: "kurz",
        personalities: ["verspielt", "liebevoll"]
    })
    petPass3 = await PetPass.create({
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
    petPass4 = await PetPass.create({
        creator: bob._id,
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
    petPass5 = await PetPass.create({
        creator: bob._id,
        picture: "testPfad",
        type: "Katze",
        name: "Harry",
        race: "Dackel",
        gender: "männlich",
        age: 5,
        size: "mittel",
        fur: "kurz",
        personalities: ["verspielt", "liebevoll"]
    })
    petPass6 = await PetPass.create({
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

test("getBookings ohne Kriterium", async () => {
    await Booking.create({
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
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    await Booking.create({
        bookedBy: john._id,
        bookedFrom: bob._id,
        slots: [slot8, slot9],
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
        location: { address: "Berlin", lat: 51, lng: 10 },
    });


    const bookingsFound = await getBookings();
    expect(bookingsFound).toHaveLength(2);
    expect(bookingsFound[0].petPasses[0].name).toBe("Harry")

})

test("getBookings mit Kriterium", async () => {
    await Booking.create({
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
        petPass: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    await Booking.create({
        bookedBy: john._id,
        bookedFrom: bob._id,
        slots: [slot8, slot9],
        date: date1,
        startTime: time1,
        totalDuration: "00:30",
        totalPrice: 0,
        activities: [
            { activity: "gassi", weight: 60, duration: "00:15", price: 5 },
            { activity: "hausbesuch", weight: 40, duration: "00:15", price: 2 },
        ],
        petPass: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });
    const criteria1 = {
        bookedBy: bob._id
    }
    const booking1 = await getBookings(criteria1);
    expect(booking1).toHaveLength(1);

    const criteria2 = {
        bookedFrom: bob._id
    }
    const booking2 = await getBookings(criteria2);
    expect(booking2).toHaveLength(1);

    const criteria3 = {
        bookedFrom: bob._id,
        bookedBy: bob._id
    }
    await expect(getBookings(criteria3)).rejects.toThrow()

    /*     const criteria1 = {
            date: [date1]
        }
        const booking1 = await getBookings(criteria1);
        expect(booking1).toHaveLength(1); 
    
        const criteria2 = {
            date: [date1, date2]
        }
        const booking2 = await getBookings(criteria2);
        expect(booking2).toHaveLength(2); 
    
        const criteria3 = {
            date: [date2, date3],
            status: "requested"
        }
        const booking3 = await getBookings(criteria3);
        expect(booking3).toHaveLength(1);
    
        const criteria4 = {
            date: [date1, date2, date3],
            creator: john.id
        }
        const booking4 = await getBookings(criteria4);
        expect(booking4).toHaveLength(3);
    
        const criteria5 = {
            status: "booked"
        }
        await expect(getBookings(criteria5)).rejects.toThrowError();
    
        const criteria6 = {
            date: [date1, date2, date3],
            time: [time1, time2],
            creator: john.id
        }
        const booking6 = await getBookings(criteria6);
        expect(booking6).toHaveLength(2);
    
        const criteria7 = {
            date: [date2, date3],
            time: [time1, time2],
            creator: john.id
        }
        const booking7 = await getBookings(criteria7);
        expect(booking7).toHaveLength(1); */

});

test("createBooking", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });
    expect(booking.bookedBy.toString()).toBe(bob._id.toString())
    expect(booking.bookedFrom.toString()).toBe(john._id.toString())
    expect(booking.slots[0].toString()).toBe(slot1._id.toString())
    expect(booking.slots[1].toString()).toBe(slot2._id.toString())
    expect(booking.date.toISOString()).toBe(date1.toISOString())
    expect(booking.startTime).toBe(time1)
    expect(booking.endTime).toBe("14:45")
    expect(booking.totalDuration).toBe("00:30")
    expect(booking.totalPrice).toBe(1.98)
    expect(booking.activities[0].activity).toBe("tierarzt");
    expect(booking.activities[0].weight).toBe(35);
    expect(booking.activities[0].duration).toBe("00:11");
    expect(booking.activities[0].price).toBe(0.35);
    expect(booking.activities[1].activity).toBe("gassi");
    expect(booking.activities[1].weight).toBe(65);
    expect(booking.activities[1].duration).toBe("00:19");
    expect(booking.activities[1].price).toBe(1.63);
    expect(booking.petPasses[0].toString()).toBe(petPass._id.toString());
    expect(booking.status).toBe("requested")
    expect(booking.remarks).toBe("Hi!")
    expect(booking.isNewCreator).toBe(true)
    expect(booking.isNewProvider).toBe(true)
});

test("createBooking at 23:45", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot11._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });
    expect(booking.bookedBy.toString()).toBe(bob._id.toString())
    expect(booking.bookedFrom.toString()).toBe(john._id.toString())
    expect(booking.slots[0].toString()).toBe(slot11._id.toString())
    expect(booking.date.toISOString()).toBe(date1.toISOString())
    expect(booking.startTime).toBe(time6)
    expect(booking.endTime).toBe("00:00")
    expect(booking.totalDuration).toBe("00:15")
    expect(booking.totalPrice).toBe(0.99)
    expect(booking.activities[0].activity).toBe("gassi");
    expect(booking.activities[0].weight).toBe(65);
    expect(booking.activities[0].duration).toBe("00:10");
    expect(booking.activities[0].price).toBe(0.81);
    expect(booking.activities[1].activity).toBe("tierarzt");
    expect(booking.activities[1].weight).toBe(35);
    expect(booking.activities[1].duration).toBe("00:05");
    expect(booking.activities[1].price).toBe(0.17);
    expect(booking.petPasses[0].toString()).toBe(petPass._id.toString());
    expect(booking.status).toBe("requested")
    expect(booking.remarks).toBe("Hi!")
});

test("createBooking Negativtests", async () => {
    await expect(createBooking({
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('No bookedBy given.');

    await expect(createBooking({
        bookedBy: bob._id,
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('No slots given.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('At least one activity must be selected.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
            { activity: "hausbesuch", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('A maximum of two activities can be selected.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 60 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('The total weight of activities must sum up to 100%.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 64 },
            { activity: "tierarzt", weight: 36 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('Weights of activities must be in steps of 5%.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot3._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('One or more slots are not available.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot10._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('Booking cannot include slots created by the booking user.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot4._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('All slots must be on the same date.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot5._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('All slots must be from the same user.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot6._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('Slots are not consecutive.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot7._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('Provider not found');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "training", weight: 100 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('Activity training is not offered by the provider.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('At least one petPass must be selected.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id, petPass2._id, petPass3._id, petPass4._id, petPass5._id, petPass6._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('A maximum of five petPasses can be selected.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass2._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow('Service for Katze is not offered by the provider.');

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass3._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    })).rejects.toThrow(`PetPass ${petPass3._id} does not belong to the user.`);

    await expect(createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
    })).rejects.toThrow(`Location is required.`);
});

test("manageBooking accept", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    const bookingAccepted = await manageBooking(booking._id, { userID: slot1.creator._id, action: "accept" });
    expect(bookingAccepted.status).toBe("accepted")

    await expect(manageBooking(booking._id, { userID: slot1.creator._id, action: "accept" })).rejects.toThrow("Booking cannot be accepted in its current state.")
});

test("manageBooking decline", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    const bookingDeclined = await manageBooking(booking._id, { userID: slot1.creator._id, action: "decline" });
    expect(bookingDeclined.status).toBe("declined")

    await expect(manageBooking(booking._id, { userID: slot1.creator._id, action: "decline" })).rejects.toThrow("Booking cannot be declined in its current state.")
});

test("manageBooking decline 2", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    const bookingDeclined = await manageBooking(booking._id, { userID: bob._id, action: "decline" });
    expect(bookingDeclined.status).toBe("declined")

    await expect(manageBooking(booking._id, { userID: slot1.creator._id, action: "decline" })).rejects.toThrow("Booking cannot be declined in its current state.")
});

test("manageBooking cancel", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    const bookingAccepted = await manageBooking(booking._id, { userID: slot1.creator._id, action: "accept" });
    expect(bookingAccepted.status).toBe("accepted")

    const slotBefore = await Slot.findById(slot1._id);
    expect(slotBefore).toBeDefined()

    const bookingCancelled = await manageBooking(booking._id, { userID: slot1.creator._id, action: "cancel" });
    expect(bookingCancelled.status).toBe("cancelled")

    const slotAfter = await Slot.findById(slot1._id);
    expect(slotAfter).toBe(null)

    await expect(manageBooking(booking._id, { userID: slot1.creator._id, action: "cancel" })).rejects.toThrow("Booking can only be cancelled if it is accepted.")
});

test("manageBooking cancel 2", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    const bookingAccepted = await manageBooking(booking._id, { userID: slot1.creator._id, action: "accept" });
    expect(bookingAccepted.status).toBe("accepted")

    const slotBefore = await Slot.findById(slot1._id);
    expect(slotBefore).toBeDefined()

    const bookingCancelled = await manageBooking(booking._id, { userID: booking.bookedBy, action: "cancel" });
    expect(bookingCancelled.status).toBe("cancelled")

    const slotAfter = await Slot.findById(slot1._id);
    expect(slotAfter.status).toBe("active")
});


test("manageBooking Negativtests", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot8._id, slot9._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });
    const invalidID = new ObjectId();
    await expect(manageBooking(undefined, { userID: slot8.creator, action: "accept" })).rejects.toThrow("Booking ID is required.")
    await expect(manageBooking(booking._id, { userID: slot8.creator, action: "nothing" })).rejects.toThrow("Invalid action provided.")
    await expect(manageBooking(booking._id, { action: "accept" })).rejects.toThrow(`UserID is required.`)
    await expect(manageBooking(invalidID, { userID: slot8.creator, action: "accept" })).rejects.toThrow(`No booking found with ID ${invalidID}.`)

    await expect(manageBooking(booking._id, { userID: booking.bookedBy, action: "accept" })).rejects.toThrow("Unauthorized")
    await expect(manageBooking(booking._id, { userID: invalidID, action: "decline" })).rejects.toThrow("Unauthorized")

    const bookingAccepted = await manageBooking(booking._id, { userID: slot8.creator._id, action: "accept" });
    expect(bookingAccepted.status).toBe("accepted")
    await expect(manageBooking(booking._id, { userID: invalidID, action: "cancel" })).rejects.toThrow("Unauthorized")

});


test("updateIsNew Creator", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    const updatedBooking = await updateIsNew(booking._id, bob._id);
    expect(updatedBooking.isNewCreator).toBe(false)
});

test("updateIsNew Provider", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    const updatedBooking = await updateIsNew(booking._id, john._id);
    expect(updatedBooking.isNewProvider).toBe(false)
});

test("updateIsNew Negativtests", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    const invalidID = new ObjectId();

    await expect(updateIsNew(undefined, john._id)).rejects.toThrow("Booking ID is required")
    await expect(updateIsNew(booking._id, undefined)).rejects.toThrow("User ID is required")
    await expect(updateIsNew(invalidID, john._id)).rejects.toThrow(`No booking found with ID ${invalidID}.`)
    await expect(updateIsNew(booking._id, booking._id)).rejects.toThrow("Unauthorized user.")

});


test("declineBookingReview Creator", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    booking.status = "done";
    await booking.save()

    const declinedReview = await declineBookingReview(booking._id, bob._id);
    expect(declinedReview.reviewCreator).toBe(true)
});

test("declineBookingReview Provider", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    booking.status = "done";
    await booking.save()

    const declinedReview = await declineBookingReview(booking._id, john._id);
    expect(declinedReview.reviewProvider).toBe(true)
});


test("declineBookingReview Negativtests", async () => {
    let booking = await createBooking({
        bookedBy: bob._id,
        slots: [slot1._id, slot2._id],
        activities: [
            { activity: "gassi", weight: 65 },
            { activity: "tierarzt", weight: 35 },
        ],
        petPasses: [petPass._id],
        remarks: "Hi!",
        location: { address: "Berlin", lat: 51, lng: 10 },
    });

    booking.status = "done";
    await booking.save()

    const invalidID = new ObjectId();

    await expect(declineBookingReview(undefined, john._id)).rejects.toThrow("Booking ID is required")
    await expect(declineBookingReview(booking._id, undefined)).rejects.toThrow("User ID is required")
    await expect(declineBookingReview(invalidID, john._id)).rejects.toThrow(`No booking found with ID ${invalidID}.`)
    await declineBookingReview(booking._id, bob._id);
    await expect(declineBookingReview(booking._id, bob._id)).rejects.toThrow(`Review can only be created once`)
    await declineBookingReview(booking._id, john._id);
    await expect(declineBookingReview(booking._id, john._id)).rejects.toThrow(`Review can only be created once`)

    booking.status = "requested";
    await booking.save()
    await expect(declineBookingReview(booking._id, john._id)).rejects.toThrow(`Review can only be created for current or done bookings`)

});