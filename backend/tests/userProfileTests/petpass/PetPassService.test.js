const PetPass = require("../../../endpoints/userProfile/petPass/PetPassModel");
const User = require("../../../endpoints/user/UserModel")
const mongoose = require ('mongoose');
const { createPetPass, getPetPassesByCreator, updatePetPass, deletePetPass } = require("../../../endpoints/userProfile/petPass/PetPassService");

let john;
const ObjectId = mongoose.Types.ObjectId;

beforeEach(async () => {
    await User.syncIndexes()
    john = await User.create({
        userID: "John",
        email: "john@some-host.de",
        password: "P4SSW0RT!",
    });
});

test("getPetPasses", async () => {
    await PetPass.create({
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

    const petPasses =  await getPetPassesByCreator(john._id);
    expect(petPasses).toHaveLength(1)

    expect(petPasses[0].name).toBe("Harry")
});

test("getPetPasses Negativtests", async () => {
    await expect(getPetPassesByCreator(john._id)).rejects.toThrow(`No petPasses for id ${john._id} found`)

});

test("createPetPass", async () => {
    const petPass = await createPetPass({
        creator: john._id,
        picture: "testPfad",
        type: "Hund",
        name: "Harry",
        race: "Dackel",
        gender: "männlich",
        age: 5,
        size: "mittel",
        fur: "kurz",
        personalities: ["verspielt", "liebevoll"],
        diseases: "keine",
        allergies: "keine",
        houseTrained: true,
        sterilized: true,
        vaccinated: true,
        chippen: false
    });


    expect(petPass.creator.toString()).toBe(john._id.toString());
    expect(petPass.type).toBe("Hund");
    expect(petPass.name).toBe("Harry");
});

test("createPetPass Negativtests", async () => {
    await expect(createPetPass({
        creator: john._id,
        picture: "testPfad",
        name: "Harry",
        race: "Dackel",
        gender: "männlich",
        age: 5,
        size: "mittel",
        fur: "kurz",
        personalities: ["verspielt", "liebevoll"],
        diseases: "keine",
        allergies: "keine",
        houseTrained: true,
        sterilized: true,
        vaccinated: true,
        chippen: false
    })).rejects.toThrow("Not enough data given.");
});

test("updatePetPass", async () => {
    const petPass = await createPetPass({
        creator: john._id,
        picture: "testPfad",
        type: "Hund",
        name: "Harry",
        race: "Dackel",
        gender: "männlich",
        age: 5,
        size: "mittel",
        fur: "kurz",
        personalities: ["verspielt", "liebevoll"],
        diseases: "keine",
        allergies: "keine",
        houseTrained: true,
        sterilized: true,
        vaccinated: true,
        chipped: false
    });

    const petPassUpdated = await updatePetPass(petPass._id, {
        age: 3
    })
    expect(petPassUpdated.age).toBe(3)

    await updatePetPass(petPass._id, {
        type: "Katze",
        name: "Katzo",
        race: "Perser",
        gender: "weiblich",
        size: "klein",
        fur: "lang",
        personalities: ["faul", "müde"],
        diseases: "viele",
        allergies: "viele",
        houseTrained: false,
        sterilized: false,
        vaccinated: false,
        chipped: true,
    })

})

test("updatePetPass Negativtests", async () => {
    await expect(updatePetPass(undefined, {
        age: 3
    })).rejects.toThrow("No id given.")
    const invalidID = new ObjectId();

    await expect(updatePetPass(invalidID, {
        age: 3
    })).rejects.toThrow("PetPass not found")
})

test("deletePetPass", async () => {
    const petPass = await createPetPass({
        creator: john._id,
        picture: "testPfad",
        type: "Hund",
        name: "Harry",
        race: "Dackel",
        gender: "männlich",
        age: 5,
        size: "mittel",
        fur: "kurz",
        personalities: ["verspielt", "liebevoll"],
        diseases: "keine",
        allergies: "keine",
        houseTrained: true,
        sterilized: true,
        vaccinated: true,
        chipped: false
    });

    await deletePetPass(petPass._id);
    const petPassDeleted = await PetPass.findById(petPass._id).exec();
    expect(petPassDeleted).toBeFalsy();
})

test("deletePetPass Negativtests", async () => {
    await expect(deletePetPass(undefined)).rejects.toThrow("No id given.")
    await expect(deletePetPass(john._id)).rejects.toThrow(`No petPass with id ${john._id} deleted, probably id not valid`)
})