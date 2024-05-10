const { User, Post, Response } = require('../models')
const { signToken, AuthenticationError } = require('../utils/auth')
const { ObjectId } = require('mongodb')

const resolvers = {
    Query: {
        //all working
        users: async () => {
            return await User.find({})
        },
        user: async (parent, { _id }) => {
            return await User.findById(_id)
        },
        posts: async () => {
            return await Post.find({}).populate("replies")
        },
        post: async (parent, { _id }) => {
            return await Post.findById(_id)
        },
        replies: async () => {
            return await Response.find({})
        }
    },

    Mutation: {
        //working
        addUser: async (parent, { username, password, name }) => {
            console.log('adding')
            return await User.create({ username, password, name })
        },
        //working
        editUser: async (parent, {userId, name, color, avatar, bio}) => {
            return await User.findByIdAndUpdate(userId, [
                {$set: {name: name}},
                {$set: {color: color}},
                {$set: {avatar: avatar}},
                {$set: {bio: bio}},
            ])
        },
        //working
        login: async (parent, { username, password }) => {
            const user = await User.findOne({ username });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);

            return { token, user };
        },
        //working
        addFriend: async (parent, { userId, friendId }) => {
            try {
                const friend = await User.findById(friendId)
                await User.findByIdAndUpdate(userId, { $push: { friends: friend._id } })
            } catch (err) {
                return err
            }
        },
        //working
        removeFriend: async (parent, { userId, friendId }) => {
            try {
                const user = await User.findById(userId)
                const friendIndex = user.friends.indexOf(friendId)
                user.friends.splice(friendIndex, 1)
                const update = await User.updateOne({
                    _id: userId
                }, user)
            } catch (err) {
                return err
            }
        },
        //working
        addPost: async (parent, { userId, postText }, context) => {
            const user = await User.findById(userId)
            try {
                const post = await Post.create({
                    user: user._id,
                    postText: postText
                })
                await User.findByIdAndUpdate(userId, { $push: { posts: post } })

                return post
            } catch (err) {
                console.error(err)
                return err
            }


        },
        //working
        deletePost: async (parent, { userId, postId }) => {
            try {
                const user = await User.findById(userId)
                const postIndex = user.posts.indexOf(user.posts.find((obj) => obj._id.toString() === postId))
                user.posts.splice(postIndex, 1)
                const update = await User.findByIdAndUpdate(userId, { posts: user.posts })
                await Post.findByIdAndDelete(postId)
            } catch (err) {
                console.error(err)
                return err
            }
        },
        //working
        addReply: async (parent, { postId, userId, responseText }) => {
            const post = await Post.findById(postId)
            post.replies.push({
                user: userId,
                responseText
            })
            await Post.findByIdAndUpdate(postId, {$set: {replies: post.replies}})
        },
        deleteReply: async (parent, { postId, replyId }) => {
            const post = await Post.findById(postId)
            const replyIndex = post.replies.indexOf(post.replies.find((reply) => reply._id.toString() === replyId))
            post.replies.splice(replyIndex, 1)
            return await Post.findByIdAndUpdate(postId, {replies: post.replies})
        }
    }
}

module.exports = resolvers