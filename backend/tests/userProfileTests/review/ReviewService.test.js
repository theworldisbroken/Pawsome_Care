const Review = require("../../../endpoints/userProfile/review/ReviewModel");
const User = require("../../../endpoints/user/UserModel")
const mongoose = require('mongoose');
const { getPostsByUser, createPost, createReview, updatePostOrReview, deletePostOrReview, createOrUpdateOrDeleteReply } = require("../../../endpoints/userProfile/review/ReviewService");
const Booking = require("../../../endpoints/booking/BookingModel")
const Slot = require("../../../endpoints/booking/SlotModel");
const PetPass = require("../../../endpoints/userProfile/petPass/PetPassModel")
const { getUserProfile } = require("../../../endpoints/userProfile/UserProfileService")

let john, bob, fred;
const ObjectId = mongoose.Types.ObjectId;
let booking, booking2, booking3, booking4, slot, petPass;
const date1 = new Date(2024, 11, 19);
const time1 = "14:15"

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

    slot = await Slot.create({
        creator: john._id,
        date: date1,
        time: time1
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

    booking = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot],
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
        status: "current",
        location: {address: "Berlin", lat: 51, lng: 10},
    });

    booking2 = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot],
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
        status: "current",
        location: {address: "Berlin", lat: 51, lng: 10},
    });

    booking3 = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot],
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
        status: "done",
        location: {address: "Berlin", lat: 51, lng: 10},
    });


    booking4 = await Booking.create({
        bookedBy: bob._id,
        bookedFrom: john._id,
        slots: [slot],
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
        status: "requested",
        location: {address: "Berlin", lat: 51, lng: 10},
    });
});

test("getPosts", async () => {
    await Review.create({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })
    await Review.create({
        creator: fred._id,
        receiver: bob._id,
        text: "Hey"
    })

    const posts = await getPostsByUser(bob._id);
    expect(posts).toHaveLength(2)

    expect(posts[0].creator.userID).toBe(john.userID)
    expect(posts[0].receiver.toString()).toBe(bob._id.toString())

});

test("getPosts Negativtests", async () => {
    await expect(getPostsByUser(john._id)).rejects.toThrow(`No posts for id ${john._id} found`)

});

test("createPost", async () => {
    const post = await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })
    expect(post.creator.toString()).toBe(john._id.toString())
    expect(post.receiver.toString()).toBe(bob._id.toString())
    expect(post.text).toBe("Hi");
})

test("createPost Negativtests", async () => {
    await expect(createPost({
        receiver: bob._id,
        text: "Hi"
    })).rejects.toThrow("No creator given.");

    await expect(createPost({
        creator: john._id,
        text: "Hi"
    })).rejects.toThrow("No receiver given.");

    await expect(createPost({
        creator: john._id,
        receiver: bob._id,
    })).rejects.toThrow("No text given.");

    await expect(createPost({
        creator: john._id,
        receiver: new ObjectId(),
        text: "Hi"
    })).rejects.toThrow("Receiver user profile not found");
});


test("createReview", async () => {
    const post = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 3
    })
    expect(post.creator.toString()).toBe(john._id.toString())
    expect(post.receiver.toString()).toBe(bob._id.toString())
    expect(post.text).toBe("Hi");
    expect(post.booking.toString()).toBe(booking._id.toString());
    expect(post.rating).toBe(3)

    const userProfile = await getUserProfile(bob._id);
    expect(userProfile.ratingAverage).toBe(3)
    expect(userProfile.ratingCount).toBe(1)
})

test("createReview mehrmals", async () => {
    await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 3
    })

    await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking2._id,
        rating: 2
    })

    const userProfile = await getUserProfile(bob._id);
    expect(userProfile.ratingAverage).toBe(2.5)
    expect(userProfile.ratingCount).toBe(2)
})

test("createReview Negativtests", async () => {
    await expect(createReview({
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 3
    })).rejects.toThrow("No creator given.");

    await expect(createReview({
        creator: john._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 3
    })).rejects.toThrow("No receiver given.");

    await expect(createReview({
        creator: john._id,
        receiver: bob._id,
        bookingID: booking._id,
        rating: 3
    })).rejects.toThrow("No text given.");

    await expect(createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        rating: 3
    })).rejects.toThrow("No bookingID given.");

    await expect(createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
    })).rejects.toThrow("No rating given.");

    await expect(createReview({
        creator: john._id,
        receiver: new ObjectId(),
        text: "Hi",
        bookingID: booking._id,
        rating: 3
    })).rejects.toThrow("Receiver user profile not found");

    await expect(createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: new ObjectId(),
        rating: 3
    })).rejects.toThrow("Booking not found");

    await expect(createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking4._id,
        rating: 3
    })).rejects.toThrow("Review can only be created for current or done bookings");

    await expect(createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 6
    })).rejects.toThrow("Rating must be between 1 and 5");

    await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 3
    })
    await expect(createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 3
    })).rejects.toThrow("Review can only be created once");

    await createReview({
        creator: bob._id,
        receiver: john._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 3
    })
    await expect(createReview({
        creator: bob._id,
        receiver: john._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 3
    })).rejects.toThrow("Review can only be created once");
})


test("updatePost", async () => {
    const post = await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })

    const updatedPost = await updatePostOrReview(post._id, { creator: john._id, text: "Hey" })
    expect(updatedPost.text).toBe("Hey")
})

test("updateReview", async () => {
    const post = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 5
    })

    const userProfile = await getUserProfile(bob._id);
    expect(userProfile.ratingAverage).toBe(5)
    expect(userProfile.ratingCount).toBe(1)

    const updatedPost = await updatePostOrReview(post._id, { creator: john._id, rating: 1 })
    expect(updatedPost.rating).toBe(1)

    const userProfile2 = await getUserProfile(bob._id);
    expect(userProfile2.ratingAverage).toBe(1)
    expect(userProfile2.ratingCount).toBe(1)
})

test("updatePost Negativtests", async () => {
    const post = await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })

    const invalidID = new ObjectId();
    await expect(updatePostOrReview(undefined, { creator: john._id, text: "Hey" })).rejects.toThrow('No id given.');
    await expect(updatePostOrReview(post._id, { text: "Hey" })).rejects.toThrow('No creator given.');
    await expect(updatePostOrReview(invalidID, { creator: john._id })).rejects.toThrow(`No post for id ${invalidID} found`);
    await expect(updatePostOrReview(post._id, { creator: bob._id, text: "Hey" })).rejects.toThrow('Unauthorized to update this post');
})

test("updateReview Negativtests", async () => {
    const post = await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })

    const review = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 5
    })

    const invalidID = new ObjectId();
    await expect(updatePostOrReview(post._id, { creator: john._id, rating: "1" })).rejects.toThrow('No booking found');
    await expect(updatePostOrReview(review._id, { creator: john._id, rating: "6" })).rejects.toThrow('Rating must be between 1 and 5');
    await expect(updatePostOrReview(post._id, { text: "Hey" })).rejects.toThrow('No creator given.');

})

test("deletePost", async () => {
    const post = await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })

    await deletePostOrReview(post._id, bob._id);
    const postDeleted = await Review.findById(post._id).exec();
    expect(postDeleted).toBeFalsy();
})

test("deleteReview", async () => {
    const post = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 5
    })

    const post2 = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking2._id,
        rating: 5
    })

    const userProfile = await getUserProfile(bob._id);
    expect(userProfile.ratingAverage).toBe(5)
    expect(userProfile.ratingCount).toBe(2)

    await deletePostOrReview(post._id, john._id);
    const postDeleted = await Review.findById(post._id).exec();
    expect(postDeleted).toBeFalsy();

    const userProfile2 = await getUserProfile(bob._id);
    expect(userProfile2.ratingAverage).toBe(5)
    expect(userProfile2.ratingCount).toBe(1)
})

test("deleteReview 2", async () => {
    const post = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 5
    })

    const userProfile = await getUserProfile(bob._id);
    expect(userProfile.ratingAverage).toBe(5)
    expect(userProfile.ratingCount).toBe(1)

    await deletePostOrReview(post._id, john._id);
    const postDeleted = await Review.findById(post._id).exec();
    expect(postDeleted).toBeFalsy();

    const userProfile2 = await getUserProfile(bob._id);
    expect(userProfile2.ratingAverage).toBe(0)
    expect(userProfile2.ratingCount).toBe(0)
})

test("deletePost Negativtest", async () => {
    let post = await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })
    const review = await createReview({
        creator: john._id,
        receiver: bob._id,
        text: "Hi",
        bookingID: booking._id,
        rating: 5
    })

    await expect(deletePostOrReview(undefined, bob._id)).rejects.toThrow("No id given.")
    await expect(deletePostOrReview(post._id, undefined)).rejects.toThrow("No userID given.")
    await expect(deletePostOrReview(bob._id, bob._id)).rejects.toThrow(`No post with id ${bob._id} found`)
    await expect(deletePostOrReview(review._id, bob._id)).rejects.toThrow(`Unauthorized to delete this post`)

})


test("createReply updateReply", async () => {
    const post = await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    });


    const reply = await createOrUpdateOrDeleteReply(post._id, {
        creator: bob._id,
        text: "Hallo"
    });

    expect(reply.reply.text).toBe("Hallo");
    expect(post.updatedAt).toEqual(reply.updatedAt);
    expect(post.updatedAt).not.toEqual(reply.reply.updatedAt);
    expect(post.createdAt).not.toEqual(reply.reply.createdAt);

    
    const reply2 = await createOrUpdateOrDeleteReply(post._id, {
        creator: bob._id,
        text: "Huhu"
    })
    expect(reply2.reply.text).toBe("Huhu");
    expect(post.updatedAt).toEqual(reply2.updatedAt);
    expect(reply.createdAt).toEqual(reply2.createdAt);
    expect(reply.reply.createdAt).toEqual(reply2.reply.createdAt);
});



test("deleteReply", async () => {
    const post = await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })
    const reply = await createOrUpdateOrDeleteReply(post._id, {
        creator: bob._id,
        text: "Hallo"
    })
    expect(reply.reply.text).toBe("Hallo");

    const reply2 = await createOrUpdateOrDeleteReply(post._id, {
        creator: bob._id,
    })
    expect(reply2.reply).toBe(null);

})

test("createReply Negativtests", async () => {
    const post = await createPost({
        creator: john._id,
        receiver: bob._id,
        text: "Hi"
    })

    const invalidID = new ObjectId();
    await expect(createOrUpdateOrDeleteReply(undefined, {
        creator: bob._id,
        text: "Hallo"
    })).rejects.toThrow("No id given.");

    await expect(createOrUpdateOrDeleteReply(post._id, {
        text: "Hallo"
    })).rejects.toThrow("No creator given.");

    await expect(createOrUpdateOrDeleteReply(invalidID, {
        creator: bob._id,
        text: "Hallo"
    })).rejects.toThrow(`No post for id ${invalidID} found`);

    await expect(createOrUpdateOrDeleteReply(post._id, {
        creator: john._id,
        text: "Hallo"
    })).rejects.toThrow("Creator must be owner");
})





