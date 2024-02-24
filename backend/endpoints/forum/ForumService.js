// ForumService.js
const Post = require('./ForumModel')

// GET all Posts
async function getAllPosts() {
  const allPosts = await Post.find();
  return allPosts
}

// GET all Posts
async function getAllPersonalPosts(mongoeID) {
  const allPosts = await Post.find({ user: mongoeID })
    .populate({
      path: 'user',
      select: 'profilePicture userID',
    })
    .populate({
      path: 'comment.user',
      select: 'profilePicture userID',
    })
    .exec();
  return allPosts
}

// GET all Posts by category
async function getPostsByCategory(category, page) {
  try {
    const skip = (page - 1) * 10;

    const posts = await Post.find({ category: category.charAt(0).toUpperCase() + category.slice(1) })
      .populate({
        path: 'user',
        select: 'profilePicture userID',
      })
      .populate({
        path: 'comment.user',
        select: 'profilePicture userID',
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(10)
      .exec();

    return posts;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function getPostsCountByCategory(category) {
  try {
    const totalPosts = await Post.countDocuments({ category: category.charAt(0).toUpperCase() + category.slice(1) });
    return totalPosts;
  } catch (error) {
    console.error('Error getting total posts:', error);
    throw error;
  }
};

// GET a single post by its ID
async function getPostById(postId) {
  try {
    const post = await Post.findById(postId)
      .populate({
        path: 'user',
        select: 'profilePicture userID', // Include both fields
      })
      .populate({
        path: 'comment.user',
        select: 'profilePicture userID',
      })
      .exec();
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  } catch (err) {
    throw new Error(err.message);
  }
}


// POST create a new post
async function createPost(data) {
  const newPost = new Post(data);
  return await newPost.save();

}

// PUT (Update) an existing post by its ID
async function updatePost(postId, data) {
  try {
    data.updatedAt = new Date();
    data.edited = true;
    const updatedPost = await Post.findByIdAndUpdate(postId, data, { new: true });
    if (!updatedPost) {
      throw new Error('Post not found');
    }
    return updatedPost;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function updatePostPicture(postid, pictureID) {
  if (postid) {
    const post = await getPostById(postid)
    if (post) {
      post.postPicture = pictureID
      return await post.save()
    }
  }
}

async function deletePostPicture(postid) {
  if (postid) {
    const post = await getPostById(postid)
    if (post) {
      post.postPicture = null;
      return await post.save()
    }
  }
}

// DELETE a post by its ID
async function deletePost(postId) {
  try {
    const deletedPost = await Post.findByIdAndRemove(postId);
    if (!deletedPost) {
      throw new Error('Post not found');
    }
    return deletedPost;
  } catch (err) {
    throw new Error(err.message);
  }
}

// Add a comment to a post by its ID
async function addComment(postId, commentData) {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    post.comment.push(commentData);
    await post.save();
    return post;
  } catch (err) {
    throw new Error(err.message);
  }
}

// Suchfunktion für Posts basierend auf dem Titel
async function searchPostsBySentence(sentence) {
  try {
    // Split the sentence into individual keywords
    const keywords = sentence.split(' ');

    // Use the keywords to perform a search
    const posts = await Post.find({
      title: { $regex: new RegExp(keywords.join('|'), 'i') }
    })
      .populate({
        path: 'user',
        select: 'profilePicture userID',
      })
      .populate({
        path: 'comment.user',
        select: 'profilePicture userID',
      })
      .exec();

    return posts;
  } catch (err) {
    throw new Error(err.message);
  }
}

// DELETE a comment from a post by post ID and comment ID
async function deleteComment(postId, commentId) {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    const updatedComments = post.comment.filter(comment => comment._id.toString() !== commentId);

    if (updatedComments.length === post.comment.length) {
      throw new Error('Comment not found');
    }

    post.comment = updatedComments;

    const updatedPost = await post.save();

    console.log('Deleted comment:', commentId);
    console.log('Updated post:', updatedPost);

    return updatedPost;
  } catch (err) {
    console.error('Error deleting comment:', err);
    throw new Error(err.message);
  }
}

async function findComment(postid, commentid) {
  try {
    const post = await Post.findById(postid);
    const commentFound = post.comment.filter((comment) => comment._id.toString() === commentid);
    return commentFound;
  } catch (err) {
    throw new Error(err.message);
  }
}

// PUT (Update) a comment in a post by post ID and comment ID
async function updateComment(postId, commentId, updatedContent) {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error('updateComment Post not found');
    }
    // console.log("commentId", commentId)
    // console.log("commentId", post.comment[0]._id.toString() === commentId)


    var foundComment = false
    const updatedComments = post.comment.filter(comment => {
      if (comment._id.toString() === commentId) {
        // Update the content of the matching comment
        comment.updatedAt = new Date();
        comment.edited = true;
        comment.content = updatedContent;
        foundComment = true;
      }
      return comment;
    });

    if (!foundComment) {
      throw new Error('Comment not found');
    }

    post.comment = updatedComments;

    const updatedPost = await post.save();

    // console.log('Updated comment:', commentId);
    // console.log('Updated post:', updatedPost);

    return updatedPost;
  } catch (err) {
    console.error('Error updating comment:', err);
    throw new Error(err.message);
  }
}



module.exports = {
  getAllPosts,
  getPostById,
  getAllPersonalPosts,
  getPostsCountByCategory,
  createPost,
  updatePost,
  deletePost,
  addComment,
  updatePostPicture,
  deletePostPicture,
  searchPostsBySentence,
  findComment,
  deleteComment,
  updateComment,
  getPostsByCategory
};





