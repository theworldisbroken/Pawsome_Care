// ForumRouter.js
const express = require('express');//Express-Modul wird importiert, um den Router zu erstellen/definieren
const router = express.Router();//Router-Objekt um Route zu definieren
const forumService = require('./ForumService'); //Modell Post wird importiert
const AuthenticationService = require('../authentication/AuthenticationService')

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the forum post
 *         content:
 *           type: string
 *           description: Content of the forum post
 *         user:
 *           type: string
 *           description: MongoDB ObjectId of the user who created the post
 *         category:
 *           type: string
 *           description: Category of the forum post
 *         likes:
 *           type: number
 *           default: 0
 *           description: Number of likes the post has received
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date and time of the post
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the post was last updated
 *         postPicture:
 *           type: string
 *           description: URL or path to the picture associated with the post
 *         edited:
 *           type: boolean
 *           default: false
 *           description: Indicates whether the post has been edited
 *         comment:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: MongoDB ObjectId of the user who created the comment
 *               content:
 *                 type: string
 *                 description: Content of the comment
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: Creation date and time of the comment
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time when the comment was last updated
 *               edited:
 *                 type: boolean
 *                 default: false
 *                 description: Indicates whether the comment has been edited
 */

// GET alle Posts, es wird auf /ForumModel geantwortet. Benutzer ruft Rote auf, Posts werden aus Datenbank abgerufen(Post.find)
//dann mmit Benutzer und Kategorie populated
//Ergebnis wird als JSON zuruckgegeben
//Ansonsten Fehler mit HttpAntwort Statuscode 500

/**
 * @swagger
 * /api/forum/:
 *   get:
 *     tags:
 *       - Forum
 *     summary: Retrieves all forum posts
 *     description: Provides a list of all posts in the forum.
 *     responses:
 *       200:
 *         description: List of all forum posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Error occurred
 */

router.get('/', async (req, res) => {
  try {
    const posts = await forumService.getAllPosts()
    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/forum/category/{category}:
 *   get:
 *     tags:
 *       - Forum
 *     summary: Retrieves posts by category
 *     description: Provides a list of posts filtered by a specific category.
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Category to filter the posts
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of posts in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 totalPosts:
 *                   type: integer
 *                   description: Total number of posts in the category
 *       400:
 *         description: Error occurred
 */

router.get('/category/:category', async (req, res) => {
  try {
    const page = req.query.page || 1; // Get the page number from the query parameters, default to 1 if not provided
    const posts = await forumService.getPostsByCategory(req.params.category, page);
    const totalPosts = await forumService.getPostsCountByCategory(req.params.category);

    res.json({
      posts: posts,
      totalPosts,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET Posts basierend auf einem Suchbegriff im Titel

/**
 * @swagger
 * /api/forum/search:
 *   get:
 *     tags:
 *       - Forum
 *     summary: Searches posts by title
 *     description: Provides a list of posts that match the search query in their title.
 *     parameters:
 *       - in: query
 *         name: search_query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query for the post titles
 *     responses:
 *       200:
 *         description: List of posts matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */

router.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.search_query;
    const posts = await forumService.searchPostsBySentence(searchQuery);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/forum/myPosts:
 *   get:
 *     tags:
 *       - Forum
 *     summary: Retrieves personal posts of the authenticated user
 *     description: Provides a list of posts created by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of personal posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       400:
 *         description: Error occurred
 */

router.get('/myPosts', AuthenticationService.isAuthenticated, async (req, res) => {
  try {
    const post = await forumService.getAllPersonalPosts(req.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET einen einzelnen Post anhand seiner ID
//GET-Route mit dem Parameter postId
//Die Route versucht Post anhand ID aus Datenbank abzurufen(mit Benutzer und Kategorie)
//wenn kein Post vorhanden, Fehlermeldung 404
//Fehler HTTP-Antwort 500

/**
 * @swagger
 * /api/forum/{id}:
 *   get:
 *     tags:
 *       - Forum
 *     summary: Retrieves a specific post by ID
 *     description: Provides details of a specific post identified by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the post
 *     responses:
 *       200:
 *         description: Details of the specific post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       400:
 *         description: Error occurred
 */

router.get('/:id', async (req, res) => {
  try {
    const post = await forumService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// POST einen neuen Post erstellen
//definiert  Postroute auf / , erstellt neuen POst
//neuer Post mit req.body(Anfrage) erstellt und in Datenbank gespeichert
//wenn erfolgreichHTTP Antwort 201 und gespeicherten Post gesendet
//bei Fehler HTTP Antwort 400

/**
 * @swagger
 * /api/forum/:
 *   post:
 *     tags:
 *       - Forum
 *     summary: Creates a new forum post
 *     description: Allows authenticated users to create a new post in the forum.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: New forum post successfully created
 *       400:
 *         description: Error occurred
 */

router.post('/', AuthenticationService.isAuthenticated, async (req, res) => {
  try {
    req.body.user = req.id;
    const newPost = await forumService.createPost(req.body)
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (Aktualisieren) eines bestehenden Posts anhand seiner ID
//versucht Post anhand ID zu finden
//mit Post.findByIdAndUpdate() um Post zu aktualisieren ->gibt true an um aktellste Dokument zurück
//Post nicht vorhanden => HTTP Antwort 404
//anderer Fehler 400 , siehe patch

/**
 * @swagger
 * /api/forum/{id}:
 *   put:
 *     tags:
 *       - Forum
 *     summary: Updates an existing forum post
 *     description: Allows authenticated users to update their own posts or an administrator to update any post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the post to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Forum post successfully updated
 *       404:
 *         description: Post not found
 *       400:
 *         description: Error occurred
 */

router.put('/:id', AuthenticationService.isAuthenticated, async (req, res) => {
  try {
    const post = await forumService.getPostById(req.params.id);
    if (post) {
      if (!req.isAdministrator && req.id == post.user._id) {
        req.body.user = req.id
        const updatedPost = await forumService.updatePost(req.params.id, req.body);
        if (!updatedPost) {
          return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json(updatedPost);
      } else {
        if (req.isAdministrator) {
          const updatedPost = await forumService.updatePost(req.params.id, req.body);
          if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
          }
          res.status(200).json(updatedPost);
        }
      }
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE einen Post anhand seiner ID
//zunächst Post finden und dann removen 
//wenn nicht gefunden wird, dann 404
//anderer Fehler 500

/**
 * @swagger
 * /api/forum/{id}:
 *   delete:
 *     tags:
 *       - Forum
 *     summary: Deletes an existing forum post
 *     description: Allows authenticated users to delete their own posts or an administrator to delete any post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the post to be deleted
 *     responses:
 *       204:
 *         description: Forum post successfully deleted
 *       404:
 *         description: Post not found
 *       400:
 *         description: Error occurred
 */

router.delete('/:id', AuthenticationService.isAuthenticated, async (req, res) => {
  try {
    const post = await forumService.getPostById(req.params.id);
    if (post) {
      if (!req.isAdministrator && req.id == post.user._id) {
        const deletedPost = await forumService.deletePost(req.params.id);
        if (!deletedPost) {
          return res.status(404).json({ error: 'Post not found' });
        }
        res.status(204).json()
      } else {
        if (req.isAdministrator) {
          const deletedPost = await forumService.deletePost(req.params.id);
          res.status(204).json()
        }
      }
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST einen Kommentar zu einem Post hinzufügen

/**
 * @swagger
 * /api/forum/{id}/comment:
 *   post:
 *     tags:
 *       - Forum
 *     summary: Adds a comment to a forum post
 *     description: Allows authenticated users to add a comment to a specific forum post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the post to add a comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content of the comment
 *     responses:
 *       201:
 *         description: Comment successfully added to the post
 *       400:
 *         description: Error occurred
 */

router.post('/:id/comment', AuthenticationService.isAuthenticated, async (req, res) => {
  try {
    req.body.user = req.id;
    const updatedPost = await forumService.addComment(req.params.id, req.body);
    res.status(201).json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (Update) a comment in a post by post ID and comment ID

/**
 * @swagger
 * /api/forum/{postId}/comment/{commentId}:
 *   put:
 *     tags:
 *       - Forum
 *     summary: Updates a comment in a forum post
 *     description: Allows authenticated users to update their own comments or an administrator to update any comment in a specific forum post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the post containing the comment
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the comment to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated content of the comment
 *     responses:
 *       200:
 *         description: Comment successfully updated
 *       400:
 *         description: Error occurred
 */

router.put('/:postId/comment/:commentId', AuthenticationService.isAuthenticated, async (req, res) => {
  try {
    const commentArray = await forumService.findComment(req.params.postId, req.params.commentId)
    const comment = commentArray[0]
    if (comment) {
      if (!req.isAdministrator && req.id == comment.user._id) {
        const updatedPost = await forumService.updateComment(req.params.postId, req.params.commentId, req.body.content);
        res.status(200).json(updatedPost);
      } else {
        if (req.isAdministrator) {
          const updatedPost = await forumService.updateComment(req.params.postId, req.params.commentId, req.body.content);
          res.status(200).json(updatedPost);
        }
      }
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a comment from a post by post ID and comment ID

/**
 * @swagger
 * /api/forum/{postId}/comment/{commentId}:
 *   delete:
 *     tags:
 *       - Forum
 *     summary: Deletes a comment from a forum post
 *     description: Allows authenticated users to delete their own comments or an administrator to delete any comment in a specific forum post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the post containing the comment
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the comment to be deleted
 *     responses:
 *       200:
 *         description: Comment successfully deleted from the post
 *       400:
 *         description: Error occurred
 */

router.delete('/:postId/comment/:commentId', AuthenticationService.isAuthenticated, async (req, res) => {
  try {
    const commentArray = await forumService.findComment(req.params.postId, req.params.commentId)
    const comment = commentArray[0]
    if (comment) {
      if (!req.isAdministrator && req.id == comment.user._id) {
        const deletedPost = await forumService.deleteComment(req.params.postId, req.params.commentId);
        res.status(200).json(deletedPost);
      } else {
        if (req.isAdministrator) {
          const deletedPost = await forumService.deleteComment(req.params.postId, req.params.commentId);
          res.status(200).json(deletedPost);
        }
      }
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



//Router-Export für httpServer.js
module.exports = router;