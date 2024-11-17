const mongoose = require('mongoose');

async function databaseCn() {
    try {
        const databaseCn = mongoose.connect('mongodb://localhost:27017/chatapp') 
        console.log('database connected successfully');
        
    } catch (error) {
        console.error(error);
        
    }

}

module.exports = databaseCn;