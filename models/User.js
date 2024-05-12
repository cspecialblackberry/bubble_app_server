const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { postSchema } = require('./Post')

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    color: {
        type: String,
        validate: {
            validator: function (color) {
                return /^#(?:[0-9a-fA-F]{3}){1,2}$/g.test(color)
            },
            message: 'Something went wrong!'
        },
        default: '#B9E5FF'
    },
    bio: {
        type: String,
        max: [150, "Bio must be less than 150 characters."]
    },
    avatar: {
        type: String,
        default: '/bubble-favicon.svg'
    },
    posts: [postSchema],
    friends: [mongoose.ObjectId],
})

// set up pre-save middleware to create password
userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10
        this.password = await bcrypt.hash(this.password, saltRounds)
    }

    next()
})

// compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const User = model('User', userSchema)

module.exports = { User, userSchema }