const express = require("express");

const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();

//CREATE A Post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch(err) {
    res.status(500).json(err);
  }
});

//UPDATE A Post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post updated successfully!");
    } else {
      res.status(403).json("You can update only your post");
    }
  } catch(err) {
    res.status(500).json(err);
  }
});

// DELETE A Post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post deleted successfully!");
    } else {
      res.status(403).json("You can delete only your post");
    }
  } catch(err) {
    res.status(500).json(err);
  }
});

// LIKE / DISLIKE A Post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId }});
      res.status(200).json("Post liked!");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId }});
      res.status(200).json("Post disliked!");
    }
  } catch(err) {
    res.status(500).json(err);
  }
});

//GET A Post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET TIMELINE Posts
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts))
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
