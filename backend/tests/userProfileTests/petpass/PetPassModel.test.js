const User = require("../../../endpoints/user/UserModel")
const PetPass = require("../../../endpoints/userProfile/petPass/PetPassModel")


let john;

beforeEach(async () => {
    john = await User.create({
        userID: "John",
        email: "john@some-host.de",
        password: "P4SSW0RT!",
    });
});

test("create petpass", async () => {
    let petPass = await PetPass.create({
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
    const petPassFound = await PetPass.findById(petPass._id);
    expect(petPassFound).not.toBeNull();
  
    expect(petPassFound.creator.toString()).toBe(john._id.toString());
    expect(petPassFound.type).toBe("Hund");
    expect(petPassFound.name).toBe("Harry");
    expect(petPassFound.gender).toBe("männlich");
    expect(petPassFound.race).toBe("Dackel");
    expect(petPassFound.age).toBe(5);
    expect(petPassFound.size).toBe("mittel");
    expect(petPassFound.fur).toBe("kurz");
    expect(petPassFound.personalities[0]).toBe("verspielt");
    expect(petPassFound.personalities[1]).toBe("liebevoll");

  });

  test("update petpass", async () => {
    let petPass = await PetPass.create({
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

    await PetPass.findByIdAndUpdate(petPass._id, { 
        age: 6,
    });

    const petPassUpdated = await PetPass.findById(petPass._id);

    expect(petPassUpdated.age).toBe(6);
});

test("delete petpass", async () => {
    let petPass = await PetPass.create({
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

    await PetPass.findByIdAndDelete(petPass._id);

    const petPassDeleted = await PetPass.findById(petPass._id);
    expect(petPassDeleted).toBeNull();
});