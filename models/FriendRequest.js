const { Schema, model} = require('mongoose')
const mongoose = require('mongoose')

const friendRequestSchema = new Schema({
    sender: mongoose.ObjectId,
    receiver: mongoose.ObjectId,
    message: {
        type: String,
        max: [150, 'Friend request message must be 150 characters or less.']
    }
})

const FriendRequest = model('FriendRequest', friendRequestSchema)

module.exports = {FriendRequest}