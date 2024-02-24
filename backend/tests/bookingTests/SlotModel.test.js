const Slot = require("../../endpoints/booking/SlotModel");
const User = require("../../endpoints/user/UserModel")


let john;
const date = new Date(2023, 11, 31);
const time = "14:30";


beforeEach(async () => {
    john = await User.create({
        userID: "John",
        email: "john@some-host.de",
        password: "P4SSW0RT!",
    });
});

test("Create and retrieve Booking", async () => {
    let slot = await Slot.create({
        creator: john._id,
        date: date,
        time: time
    });

    const slotFound = await Slot.findById(slot._id).populate('creator');
    expect(slotFound.creator.email).toBe("john@some-host.de");
    expect(slotFound.date.toISOString).toBe(date.toISOString);
    expect(slotFound.time).toBe("14:30");
    expect(slotFound.status).toBe("active");
    expect(slotFound.booking).toBe(null);
});

test("Update Slot", async () => {
    let bob = await User.create({
        userID: "Bob",
        email: "bob@some-host.de",
        password: "P4SSW0RT!",
    });
    let slot = await Slot.create({
        creator: john._id,
        date: date,
        time: time
    });

    await Slot.findByIdAndUpdate(slot._id, { 
        status: "requested",
    });

    const slotUpdated = await Slot.findById(slot._id).populate('creator');
    expect(slotUpdated.creator.email).toBe("john@some-host.de");
    expect(slotUpdated.date.toISOString).toBe(date.toISOString);
    expect(slotUpdated.time).toBe("14:30");
    expect(slotUpdated.status).toBe("requested");
});

test("Delete Slot", async () => {
    let slot = await Slot.create({
        creator: john._id,
        date: date,
        time: time    
    });

    await Slot.findByIdAndDelete(slot._id);

    const deletedSlot = await Slot.findById(slot._id);
    expect(deletedSlot).toBeNull();
});