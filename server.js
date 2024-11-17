const express = require('express');
const app = express()
const path = require('path');
const userRoute = require('./routers/userRoutes');
const chatRoute = require('./routers/chatRoutes')
const cookieParser = require('cookie-parser');
const databaseCn = require('./connection/dbConnect')

databaseCn()

app.use(express.static(path.join(__dirname,'public')))  
app.use(express.urlencoded({extended : false}))
app.use(express.json())
   
app.set('view engine','ejs')
app.set('views',path.join(__dirname,"views"))
app.use(cookieParser())
app.use('/',userRoute)
app.use('/chat',chatRoute)

let server = app.listen(5000,(err)=>{
   if(err){
      console.error(err);
   }else{
   console.log('server running successfully...');
   }
})

const io = require('socket.io')(server)

io.on('connection', (socket) => {
   console.log('A user connected...');
   let sender;
   socket.on('create-room', (userId) => {
       sender = userId;
       socket.join(userId);
   });


   socket.on('private-chat', (data) => {
       const { message, receiverId } = data;
       io.to(receiverId).emit('msg', { message, sender });
   });

   socket.on('GroupChat', (data) => {
       const { message, usersArray } = data;
       usersArray.forEach(userId => {
           if (io.sockets.adapter.rooms.has(userId)) {
               io.to(userId).emit('groupmsg', { message, sender });
               console.log(`Group message sent to ${userId}`);
           } else {
               console.log(`User ${userId} is not connected.`);
           }
       });
   });


   // socket.on('disconnect', () => {
   //     console.log('User disconnected:', socket.id);
   //     // Optionally, remove the user from the room
   // });
});
