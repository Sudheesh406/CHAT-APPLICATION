const User = require('../models/userSchema')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const secretKey = "newuser123"

async function newUser(req,res){
  const {email, username, password} = req.body;
  try {
    const existingUser = await User.findOne({email:email})
    if(existingUser){
      console.log('user already created a account');
      return res.status(400).redirect("/signup")
    }else{
      const hashedPassword  = await bcrypt.hash(password, 10)
     let newUser =  await User .create({email, username, password:hashedPassword})
        let accessToken =  jwt.sign({
          id : newUser.id
        }, secretKey,{expiresIn:"24hr"})
    
      res.cookie('token',accessToken)
      console.log(" new user created");
      return res.redirect('/')  
    }
  } catch (error) {
    console.error(error,"error found in creating User");
  }
}

async function loginPageRender(req,res) {
  res.render('login')
}

async function login(req,res) {
  const {email, password} = req.body
 
  try {
    let acess = await User.findOne({email : email})
    if(!acess){
      console.log("User not found");
      return res.status(404).redirect("/login")
    }else{
      const correctPassword = await bcrypt.compare(password, acess.password);
      if(!correctPassword){
        console.log('incorrect password');
        return res.status(404).redirect("/login")
      }else{
        let acessToken = jwt.sign({
          id : acess.id
        },secretKey,{expiresIn:'24hr'})
        res.cookie('token',acessToken)
        console.log('user login successfully...');
        return res.redirect('/')
      }
    }
  } catch (error) {
    console.error(error,"error found in login");
    res.status(500).send("error login user")
  }
}

async function renderHome(req,res) {
  let id = req.User.id;
  let allUser = await User.find({})
  let withOutUser = allUser.filter(user => user.id != id)
  let loginUser = allUser.find(user => user.id == id)
  res.render('home',{withOutUser,loginUser})
}

async function logout(req,res){ 
    res.clearCookie('token')  
     return res.redirect('/login') 
  }


module.exports = {newUser,login,renderHome,logout,loginPageRender}