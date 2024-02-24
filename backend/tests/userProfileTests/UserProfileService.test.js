const Booking = require("../../endpoints/booking/BookingModel");
const User = require("../../endpoints/user/UserModel")
const mongoose = require ('mongoose');
const { getUserProfile, updateUserProfile, toggleFavorite } = require("../../endpoints/userProfile/UserProfileService");

let john;
let bob;


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
});


test("getUserProfile", async () => {
    const userProfile = await getUserProfile(john._id);
    expect(userProfile.user._id.toString()).toBe(john._id.toString())
    expect(userProfile.user.userID).toBe("john")
    //expect(userProfile.ratingCount).toBe(3)
    //expect(userProfile.ratingAverage).toBe(3.7)


    const newObjectId = new mongoose.Types.ObjectId();
    await expect(getUserProfile(newObjectId)).rejects.toThrowError(`No userProfile with id ${newObjectId} found`);

})

test("updateUserProfile alles updaten", async () => {
    const userProfile = await getUserProfile(john._id);
    expect(userProfile.user._id.toString()).toBe(john._id.toString())

    const userProfileUpdated = await updateUserProfile(john._id, {
        aboutme:"hi",
        location: {address: "Berlin", coordinates:[51, 10]},
        dog: true,
        cat: false,
        gassi: { price: 5},
        tierarzt: { price: 2},
        training: { price: 3},
        hausbesuch: { offered: true }

    })
    expect(userProfileUpdated.aboutme).toBe("hi");
    expect(userProfileUpdated.location.address).toBe("Berlin");
    expect(userProfileUpdated.location.coordinates[0]).toBe(51);
    expect(userProfileUpdated.location.coordinates[1]).toBe(10);
    expect(userProfileUpdated.dog).toBe(true);
    expect(userProfileUpdated.cat).toBe(false);
    expect(userProfileUpdated.gassi.offered).toBe(false);
    expect(userProfileUpdated.gassi.price).toBe(5);
    expect(userProfileUpdated.tierarzt.price).toBe(2);
    expect(userProfileUpdated.training.price).toBe(3);
    expect(userProfileUpdated.hausbesuch.offered).toBe(true);

})

test("updateUserProfile teilweise updaten", async () => {
    const userProfile = await getUserProfile(john._id);
    expect(userProfile.user._id.toString()).toBe(john._id.toString())

    const userProfileUpdated = await updateUserProfile(john._id, {
        aboutme:"hi",
    })
    expect(userProfileUpdated.aboutme).toBe("hi");
    
    const userProfileUpdatedAgain = await updateUserProfile(john._id, {
        location: {address: "Berlin", coordinates:[51, 10]},
    })
    expect(userProfileUpdatedAgain.aboutme).toBe("hi");
    expect(userProfileUpdatedAgain.location.address).toBe("Berlin");


})

test("updateUserProfile Negativtests", async () => {
    const userProfile = await getUserProfile(john._id);
    expect(userProfile.user._id.toString()).toBe(john._id.toString())

    await expect(updateUserProfile(john._id)).rejects.toThrowError(`data missing, cannot update`);
    await expect(updateUserProfile(undefined, {aboutme: "hi"})).rejects.toThrowError(`userID missing, cannot update`);
    const newObjectId = new mongoose.Types.ObjectId();
    await expect(updateUserProfile(newObjectId, {aboutme: "hi"})).rejects.toThrowError(`No userProfile with id ${newObjectId} found, cannot update`);
})


test("toggleFavorite", async () => {
    const favorite1 = await toggleFavorite(john._id, bob._id);
    expect(favorite1.favorites).toEqual(expect.arrayContaining([bob._id]));
    
    const favorite2 = await toggleFavorite(john._id, bob._id);
    expect(favorite2.favorites).not.toEqual(expect.arrayContaining([bob._id]));
})

test("toggleFavorite Negativtests", async () => {
    const newObjectId = new mongoose.Types.ObjectId();
    await expect(toggleFavorite(undefined, bob._id)).rejects.toThrow("userID missing, cannot toggle");
    await expect(toggleFavorite(john._id, undefined)).rejects.toThrow("favoriteID missing, cannot toggle");
    await expect(toggleFavorite(newObjectId, bob._id)).rejects.toThrow("Profile not found");
    await expect(toggleFavorite(bob._id, bob._id)).rejects.toThrow("Cannot favorite oneself");

})