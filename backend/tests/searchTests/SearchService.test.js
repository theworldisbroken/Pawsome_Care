const UserProfile = require("../../endpoints/userProfile/UserProfileModel")
const User = require("../../endpoints/user/UserModel")
const Slot = require("../../endpoints/booking/SlotModel");
const { getFilteredProfiles } = require("../../endpoints/search/searchService");

const mongoose = require('mongoose');
let john, bob, fred;
let profileJohn, profileBob, profileFred;
let slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9, slot10;

const date1 = new Date(2023, 11, 19);
const date2 = new Date(2023, 11, 21);
const date3 = new Date(2023, 11, 22);

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


    profileJohn = await UserProfile.updateOne({ user: john._id }, {
        user: john._id,
        dog: true,
        cat: false,
        gassi: { offered: true, price: 5 },
        tierarzt: { offered: true, price: 2 },
        training: { offered: true, price: 3 },
        hausbesuch: { offered: true, price: 4 },
        herberge: { offered: false, price: 4 },
        location: { type: 'Point', address: "12345 Berlin, Deutschland", coordinates: [51, 10] }
    });

    profileBob = await UserProfile.updateOne({ user: bob._id }, {
        user: bob._id,
        dog: false,
        cat: true,
        gassi: { offered: true, price: 5 },
        tierarzt: { offered: true, price: 2 },
        training: { offered: true, price: 3 },
        hausbesuch: { offered: true, price: 4 },
        herberge: { offered: false, price: 4 },
        location: { type: 'Point', address: "12345 Berlin, Deutschland", coordinates: [51, 10] }
    });

    profileFred = await UserProfile.updateOne({ user: fred._id }, {
        user: fred._id,
        dog: true,
        cat: true,
        gassi: { offered: true, price: 5 },
        tierarzt: { offered: true, price: 2 },
        training: { offered: false, price: 3 },
        hausbesuch: { offered: true, price: 4 },
        herberge: { offered: false, price: 4 },
        location: { type: 'Point', address: "12345 Berlin, Deutschland", coordinates: [51, 10] }
    });


    slot1 = await Slot.create({
        creator: john._id,
        date: date1,
        time: time1
    });

    slot2 = await Slot.create({
        creator: john._id,
        date: date2,
        time: time1
    });

    slot3 = await Slot.create({
        creator: john._id,
        date: date3,
        time: time1
    });

    slot4 = await Slot.create({
        creator: bob._id,
        date: date1,
        time: time3
    });

    slot5 = await Slot.create({
        creator: fred._id,
        date: date1,
        time: time3
    });
});


test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({});
    expect(userProfiles.profiles).toHaveLength(3);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            services: ["gassi", "training"]
        }
    });
    expect(userProfiles.profiles).toHaveLength(2);

});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            services: ["gassi", "training"],
            pets: ["dog"]
        }
    });
    expect(userProfiles.profiles).toHaveLength(1);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            pets: ["dog"]
        }
    });
    expect(userProfiles.profiles).toHaveLength(2);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            dates: [date2],
        }
    });
    expect(userProfiles.profiles).toHaveLength(1);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            dates: [date1],
            times: [time1]
        }
    });
    expect(userProfiles.profiles).toHaveLength(1);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            times: [time1]
        }
    });
    expect(userProfiles.profiles).toHaveLength(1);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            dates: [date1, date3]
        }
    });
    expect(userProfiles.profiles).toHaveLength(3);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            dates: [date2, date3]
        }
    });
    expect(userProfiles.profiles).toHaveLength(1);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            times: [time1, time3]
        }
    });
    expect(userProfiles.profiles).toHaveLength(3);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            dates: [date2, date3],
            times: [time1, time3]
        }
    });
    expect(userProfiles.profiles).toHaveLength(1);
});

test("findUserProfiles", async () => {
    const userProfiles = await getFilteredProfiles({
        filter: {
            location:
            {
                topLeft: {lat: 54.864028001772866, lng: -2.5903320312499956},
                bottomRight: {lat: 47.14497437544359, lng: 21.623535156250004},
                center: {lat: 51.165637488221606, lng: 9.516601562500004}
            }

        }
    });
    expect(userProfiles.profiles).toHaveLength(3);
}); 