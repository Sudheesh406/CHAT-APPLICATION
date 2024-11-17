const mongoose = require('mongoose');
const chat = require('../models/chatSchema')
const allMessage = require('../models/msgSchema');
const databaseCn = require('../connection/dbConnect');
let loginUserId

async function getUserId (req,res){
    loginUserId = req.User.id
    return res.status(200).json(loginUserId)
}

const createChatController = async (req, res) => {
    try {
        const { id: receiverId } = req.body; 
        const loginUserId = req.User.id;    

    let users = [
       new mongoose.Types.ObjectId(loginUserId),
       new mongoose.Types.ObjectId(receiverId)
    ];
    
        const isExist = await chat.findOne({
            users: { $all: [loginUserId, receiverId] }
          });
          if(isExist){
              const messages  = await allMessage.find({chatId:isExist._id})
              if(messages){
                  res.status(201).json({id:isExist._id,messages})
              }else{
                  res.status(201).json({id:isExist._id})
              }
          }

        let newChat = await chat.create({users})
        if(newChat){
            console.log('newchat created successfully...');
            
        }else{
            console.error('error found in create newChat');
            
        }
    } catch (error) {
        console.error("error found in create chatDetails :",error);
    }
}

async function chatAndMsg(req,res){
    let loginUser = req.User.id
    console.log("userID :",loginUser);
    if(req.body){
        let {id,message} = req.body  
        console.log("chatId :",id);   
        createMessage({chatId :id,senderId: loginUser,content: message})
    }else{
        console.log('not getting message and id');
    }
}
 async function createMessage(data) {
    let {chatId,senderId,content} = data;
    let result = await allMessage.create({chatId,senderId,content})
    if(result){
        console.log('message created successfully....');
    }else{
        console.log("message is not created");
        
    }
 }

 async function groupChat(req, res) {
     try {
         const data = req.body;
         if (!data.groupnm || !data.groupdetail || !data.lUser) {
             return res.status(400).json({ error: 'Invalid group data' });
         }        
         const result = await createGroupChat({
             groupName: data.groupnm,
             adminId: data.lUser, 
             userIds: data.groupdetail.map(member => member.id),
             isGroupChat: true,
         });
 
         res.status(200).json(result);
     } catch (error) {
         console.error('Error in groupChat:', error);
         res.status(500).json({ error: 'Internal server error' });
     }
 }
 
 async function createGroupChat({ groupName, adminId, userIds, isGroupChat }) {
     try {
         const users = userIds.map(id => new mongoose.Types.ObjectId(id));
         const groupAdmin = new mongoose.Types.ObjectId(adminId);
         users.push(new mongoose.Types.ObjectId(adminId));
         const existingGroup = await chat.findOne({
             name: groupName,
             isGroupChat,
             users: { $all: users }
         });
 
         if (existingGroup) {
             return { groupId: existingGroup._id };
         }
         const newGroupChat = await chat.create({
             name: groupName,
             isGroupChat,
             users,
             groupAdmin
         });
 
         if (newGroupChat) {
             return { groupId: newGroupChat._id };
         } else {
             throw new Error('Failed to create group chat');
         }
     } catch (error) {
         console.error('Error creating group chat:', error);
         throw error;
     }
 }

  async function displayGroups(req,res){
    let data = await chat.find({isGroupChat:true})
    return res.status(200).json(data)
  }

  async function groupAndMsg(req,res){
    let loginUser = req.User.id
    console.log("userID :",loginUser);
    if(req.body.message){
        let {id,message} = req.body  
        console.log("chatId :",id);   
        createMessage({chatId :id,senderId: loginUser,content: message})
    }else if(req.body.id){
        console.log("id :",id);
        
    }
}

async function groupReceiver(req, res) {
    let result = req.body;
    console.log('result from post:', result);
    try {
        let response = await chat.findById(result.id); 
        if (!response) {
            console.log('Chat not found');
            return res.status(404).json({ message: 'Chat not found' }); 
        }
        console.log(response);
        return res.status(200).json(response); 
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message }); 
    }
}

async function groupMsgReturn(req,res) {
    let itemId = req.body
    console.log(itemId);
    let messages = await allMessage.find({chatId:itemId.id})
    console.log("finded:",messages);
              if(messages){
                  res.status(201).json({id:messages._id,messages})
              }else{
                  res.status(201).json({id:messages._id})
              }
}


module.exports = {createChatController,getUserId,chatAndMsg,groupChat,displayGroups,groupAndMsg,groupReceiver,groupMsgReturn};