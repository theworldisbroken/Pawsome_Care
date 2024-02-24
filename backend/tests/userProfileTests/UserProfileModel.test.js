const User = require("../../endpoints/user/UserModel")
const UserProfile = require("../../endpoints/userProfile/UserProfileModel")


let john;
const fullDate = new Date(2023, 11, 31, 14, 30);

beforeEach(async () => {
    john = await User.create({
        userID: "John",
        email: "john@some-host.de",
        password: "P4SSW0RT!",
    });
});

test("UserProfil wird beim registrieren erstellt", async () => {

    const userProfile = await UserProfile.findOne({ user: john._id });
    expect(userProfile).not.toBeNull();
  
    expect(userProfile.aboutme).toBe("");
    expect(userProfile.location.address).toBe(null);
    expect(userProfile.location.coordinates[0]).toBe(51);
    expect(userProfile.location.coordinates[1]).toBe(10);
    expect(userProfile.dog).toBe(false);
    expect(userProfile.cat).toBe(false);
    expect(userProfile.hausbesuch.offered).toBe(false);   
    expect(userProfile.hausbesuch.price).toBe(0);   
});

  test("Update UserProfile", async () => {
    let bob = await User.create({
        userID: "Bob",
        email: "bob@some-host.de",
        password: "P4SSW0RT!",
    });

    const userProfile = await UserProfile.findOneAndUpdate({ user: bob._id },
        { 
        aboutme: "hi",
        location: {address: "Berlin", coordinates: [51, 10]},
        dog: true,
        cat: false,
        gassi: {offered: true, price: 5},
        location: {type: 'Point' , address: "12345 Berlin, Deutschland", coordinates: [51,10]}
        },
        { new: true }
        );

    expect(userProfile.aboutme).toBe("hi");
    expect(userProfile.location.address).toBe("12345 Berlin, Deutschland");
    expect(userProfile.location.coordinates[0]).toBe(51);
    expect(userProfile.location.coordinates[1]).toBe(10);
    expect(userProfile.dog).toBe(true);
    expect(userProfile.cat).toBe(false);
    expect(userProfile.gassi.offered).toBe(true);
    expect(userProfile.gassi.price).toBe(5);

});
