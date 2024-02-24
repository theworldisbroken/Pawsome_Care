const User = require("../../../endpoints/user/UserModel")
const Review = require("../../../endpoints/userProfile/review/ReviewModel")


let john;
let bob;

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
});

test("create post", async () => {
    let post = await Review.create({
        creator: bob._id,
        receiver: john._id,
        text: "Hi",
        reply: { text: "Hallo" }
    })
    const postFound = await Review.findById(post._id);
    expect(postFound).not.toBeNull();
  
    expect(postFound.text).toBe("Hi");
    expect(postFound.creator.toString()).toBe(bob._id.toString());
    expect(postFound.receiver.toString()).toBe(john.id.toString());
    expect(postFound.reply.text).toBe("Hallo");

  });

  test("update post", async () => {
    let post = await Review.create({
        creator: bob._id,
        receiver: john._id,
        text: "Hi",
        reply: { text: "Hallo" }
    })
    await Review.findByIdAndUpdate(post._id, { 
        text: "Hey"
    });

    const postUpdated = await Review.findById(post._id);
    expect(postUpdated.text).toBe("Hey");
});

test("delete post", async () => {
    let post = await Review.create({
        creator: bob._id,
        receiver: john._id,
        text: "Hi",
    })

    await Review.findByIdAndDelete(post._id);

    const postDeleted = await Review.findById(post._id);
    expect(postDeleted).toBeNull();
});