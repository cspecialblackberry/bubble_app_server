const { Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const responseSchema = new Schema({
    user: {
        type: Mongoose.ObjectId,
        unique: false
    },
    responseText: {
        type: String,
        required: true,
        max: [150, "Response must be 150 characters or less."]
    }
})

const postSchema = new Schema ({
    user: {
        type: Mongoose.ObjectId,
        unique: false
    },
    postText: {
        type: String,
        required: true,
        unique: false,
        max: [150, "Post must be 150 characters or less."]
    },
    replies: [responseSchema]
})

const Response = model('Response', responseSchema)
const Post = model('Post', postSchema) 

module.exports = {Post, Response, postSchema}