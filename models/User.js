// Create Mongo Data Base Array
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: false
    },
    email:{
        type: String,
        required: false
    },
    password:{
        type: String,
        required: false
    },
    eid:{
        type: Number,
        required: false
    },
    role:{
        type: String,
        required: false
    },
    hostel:{
        type:String,
        required: false
    },
    date:{
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('user', UserSchema);

module.exports = User;

