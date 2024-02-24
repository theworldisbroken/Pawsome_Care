const Slot = require("../../endpoints/booking/SlotModel");
const { getSlots, createSlot, deleteSlot, manageSlots } = require("../../endpoints/booking/SlotService");
const User = require("../../endpoints/user/UserModel")


let john;
let slots;
const date1 = new Date(2027, 11, 29);
const date2 = new Date(2027, 11, 30);
const date3 = new Date(2027, 11, 31);

const time1 = "14:15"
const time2 = "14:30"
const time3 = "14:45"

beforeEach(async () => {
    await User.syncIndexes()
    john = await User.create({
        userID: "John",
        email: "john@some-host.de",
        password: "P4SSW0RT!",
    });

});

test("getSlots ohne Kriterium", async () => {
    await Slot.create({
        creator: john._id,
        date: date1,
        time: time1,
    });

    await Slot.create({
        creator: john._id,
        date: date2,
        time: time2,    
    });

    await Slot.create({
        creator: john._id,
        date: date3,
        time: time3,    
    });

    const slotsFound = await getSlots();
    expect(slotsFound).toHaveLength(3); 
    const slot1 = slotsFound[0];
    const slot2 = slotsFound[1];
    const slot3 = slotsFound[2];

    expect(slot1.creator.toString()).toBe(john.id);
    expect(slot1.date.toISOString()).toBe(date1.toISOString());
    expect(slot1.time).toBe(time1);
    expect(slot2.creator.toString()).toBe(john.id);
    expect(slot2.date.toISOString()).toBe(date2.toISOString());
    expect(slot2.time).toBe(time2);
    expect(slot3.creator.toString()).toBe(john.id);
    expect(slot3.date.toISOString()).toBe(date3.toISOString());
    expect(slot3.time).toBe(time3);

})

test("getSlots mit Kriterium", async () => {
    await Slot.create({
        creator: john._id,
        date: date1,
        time: time1,
        status: "active"
    });

    await Slot.create({
        creator: john._id,
        date: date2,
        time: time2,
        status: "active"
    });

    await Slot.create({
        creator: john._id,
        date: date3,
        time: time3,
        status: "requested"
    });

    const criteria1 = {
        date: [date1]
    }
    const slot1 = await getSlots(criteria1);
    expect(slot1).toHaveLength(1); 

    const criteria2 = {
        date: [date1, date2]
    }
    const slot2 = await getSlots(criteria2);
    expect(slot2).toHaveLength(2); 

    const criteria3 = {
        date: [date2, date3],
        status: "requested"
    }
    const slot3 = await getSlots(criteria3);
    expect(slot3).toHaveLength(1);

    const criteria4 = {
        date: [date1, date2, date3],
        creator: john.id
    }
    const slot4 = await getSlots(criteria4);
    expect(slot4).toHaveLength(3);

    const criteria5 = {
        status: "booked"
    }
    const s = JSON.stringify(criteria5)
    await expect(getSlots(criteria5)).rejects.toThrowError(`No slots with criteria found`);

    const criteria6 = {
        date: [date1, date2, date3],
        time: [time1, time2],
        creator: john.id
    }
    const slot6 = await getSlots(criteria6);
    expect(slot6).toHaveLength(2);

    const criteria7 = {
        date: [date2, date3],
        time: [time1, time2],
        creator: john.id
    }
    const slot7 = await getSlots(criteria7);
    expect(slot7).toHaveLength(1);

});

test("createSlot", async () => {
    slots = await createSlot({
        creator: john._id, 
        dates: [date1, date2],
        times: [time1, time2]
    });

    expect(slots).toHaveLength(4);
    const slot1 = slots[0];
    const slot2 = slots[1];
    const slot3 = slots[2];
    const slot4 = slots[3];
    expect(slot1.creator.toString()).toBe(john.id);
    expect(slot1.date.toISOString()).toBe(date1.toISOString());
    expect(slot1.time).toBe(time1);
    expect(slot2.creator.toString()).toBe(john.id);
    expect(slot2.date.toISOString()).toBe(date1.toISOString());
    expect(slot2.time).toBe(time2);
    expect(slot3.creator.toString()).toBe(john.id);
    expect(slot3.date.toISOString()).toBe(date2.toISOString());
    expect(slot3.time).toBe(time1);
    expect(slot4.creator.toString()).toBe(john.id);
    expect(slot4.date.toISOString()).toBe(date2.toISOString());
    expect(slot4.time).toBe(time2);

});

test("createSlot Negativtests", async () => {
    await expect(createSlot({
        dates: [date1, date2, date3],
        time: [time1]
    })).rejects.toThrow("No creator given");

    await expect(createSlot({
        creator: john._id, 
        time: [time1]
    })).rejects.toThrow("No dates given");

    await expect(createSlot({
        creator: john._id, 
        dates: [date1, date2, date3],
    })).rejects.toThrow("No times given");
});

test("createSlot, status nicht änderbar", async () => {
    slots = await createSlot({
        creator: john._id, 
        dates: [date1, date2, date3],
        times: [time1],
        status: "requested"
    });

    const slot = slots[0];
    expect(slot.creator.toString()).toBe(john.id);
    expect(slot.date.toISOString()).toBe(date1.toISOString());
    expect(slot.status).toBe("active");
})

test("deleteSlot", async () => {
    slots = await createSlot({
        creator: john._id, 
        dates: [date1, date2, date3],
        times: [time1, time2]
    });
    expect(slots).toHaveLength(6);

    await deleteSlot({
        creator: john._id, 
        dates: [date1],
        times: [time1]
    });

    slots = await getSlots();
    expect(slots).toHaveLength(5);

    await deleteSlot({
        creator: john._id, 
        dates: [date2],
        times: [time1, time2]
    });

    slots = await getSlots();
    expect(slots).toHaveLength(3);

    await expect(deleteSlot({
        creator: john._id, 
        dates: [date1],
        times: [time1]
    })).rejects.toThrow("No active slots found for the specified dates.");

    slots = await getSlots();
    expect(slots).toHaveLength(3);
});

test("deleteSlot ohne ID", async () => {
    await expect(deleteSlot({
        dates: [date1, date2, date3],
        times: [time1]
    })).rejects.toThrowError("No creator given.");

    await expect(deleteSlot({
        creator: john._id, 
        times: [time1]
    })).rejects.toThrowError("No dates given.");

    await expect(deleteSlot({
        creator: john._id, 
        dates: [date1, date2, date3],
    })).rejects.toThrowError("No times given.");
});

test("manageSlots", async () => {
    slots = await manageSlots({
        creator: john._id, 
        dates: [date1, date2],
        times: [time1, time2]
    });

    console.log(slots)
    expect(slots.created).toBe(4);
    expect(slots.deleted).toBe(0);

    const slotsFound = await Slot.find({creator: john._id}).sort({ date: 1, time: 1 }).exec();
    const slot1 = slotsFound[0];
    const slot2 = slotsFound[1];
    const slot3 = slotsFound[2];
    const slot4 = slotsFound[3];
    expect(slot1.creator.toString()).toBe(john.id);
    expect(slot1.date.toISOString()).toBe(date1.toISOString());
    expect(slot1.time).toBe(time1);
    expect(slot2.creator.toString()).toBe(john.id);
    expect(slot2.date.toISOString()).toBe(date1.toISOString());
    expect(slot2.time).toBe(time2);
    expect(slot3.creator.toString()).toBe(john.id);
    expect(slot3.date.toISOString()).toBe(date2.toISOString());
    expect(slot3.time).toBe(time1);
    expect(slot4.creator.toString()).toBe(john.id);
    expect(slot4.date.toISOString()).toBe(date2.toISOString());
    expect(slot4.time).toBe(time2);

    slot1.status = "booked";
    await slot1.save();

    slots = await manageSlots({
        creator: john._id, 
        dates: [date1, date2],
        times: [time1, time2]
    });

    expect(slots.created).toBe(0);
    expect(slots.deleted).toBe(3);
});

test("manageSlots Negativtests", async () => {
    await expect(manageSlots({
        dates: [date1, date2, date3],
        time: [time1]
    })).rejects.toThrow("No creator given");

    await expect(manageSlots({
        creator: john._id, 
        time: [time1]
    })).rejects.toThrow("No dates given");

    await expect(manageSlots({
        creator: john._id, 
        dates: [date1, date2, date3],
    })).rejects.toThrow("No times given");
});