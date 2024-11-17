const jwt = require('jsonwebtoken');
require('dotenv').config()

async function auth(req,res,next) {
    let token = req.cookies?.token
    if(!token){
        res.redirect('/login')
    }else{
        try {
            let user = jwt.verify(token,process.env.SECRET_KEY);
            if(user){
                req.User = user; 
                next()
            }else{
                res.redirect('/login')
            }           
        } catch (error) {  
            console.error(error,"authentication found some error");
                             
        }
    }
}


module.exports = auth;