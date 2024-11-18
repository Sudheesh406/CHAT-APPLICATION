const mongoose = require('mongoose');

async function databaseCn() {
    try {
        const databaseCn = mongoose.connect(process.env.MONGO_DB_URL) 
        console.log('database connected successfully');
        
    } catch (error) {
        console.error(error);
        
    }

}

module.exports = databaseCn;