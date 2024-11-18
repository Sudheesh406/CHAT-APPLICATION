const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
    chatId:{
        type:String,
        required:true
    },
    senderId:{
        type:String,
        required:true,
        ref:"User"
    },
    content:{
        type:String,
    }
})

const allMessage = mongoose.model('allmessage',msgSchema)

module.exports = allMessage;