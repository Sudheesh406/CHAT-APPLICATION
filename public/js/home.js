const socket = io();
let receiverMessage;
let clickUserId;
let userId
let groupMembers = []
let groupNameInput
let gpreceiverId = []
let usersArray 
socket.on("msg", (data) => {
  if (clickUserId == data.sender) {
    let chatBox = document.getElementById("chatBox");
    chatBox.style.display='block'
    let li = document.createElement("li");
    li.classList.add("receiver");
    li.innerHTML = data.message;
    receiverMessage = data.message;
    chatBox.appendChild(li);
  }
});

let receiverId;
let sentBtn = document.getElementById("sentBtn");
let prevId = null;

let chatId;

async function createChat(id, name) {
  document.getElementById("gpsendMsg").style.display = "none";
  document.getElementById("gpsentBtn").style.display = "none";
  document.getElementById('chatBox').innerHTML=''
  if (name) {
    let receiverName = document.getElementById("receiverName");
    receiverName.style.display = " block";
    receiverName.innerHTML = name;
  }
  clickUserId = id;
  if (prevId) {
    document.getElementById(prevId).classList.toggle("red");
  }
  document.getElementById(id).classList.toggle("red");
  document.getElementById("sendMsg").style.display = "block";

  sentBtn.style.display = "block";
  receiverId = id;
  prevId = id;
  try {
    const userId = { id: id };
    let result = await fetch("http://65.0.199.81:5000/chat/createChat", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userId),
    });
    let response = await result.json();
    if (response) {
       console.log(response);
       console.log(userId);
       response.messages.forEach((msg) => {
      if(userId.id.toString() === msg.senderId.toString()){
        console.log('true');
        let chatBox = document.getElementById('chatBox')
        let li = document.createElement('li')
        li.classList.add("receiver");
        li.innerHTML= msg.content
        chatBox.appendChild(li)
      }else{
        let chatBox = document.getElementById('chatBox')
        let li = document.createElement('li')
        li.classList.add("sent");
        li.innerHTML= msg.content
        chatBox.appendChild(li)
      }
    }); 
      chatId = response.id;
      console.log(chatId,"from respose.id");
      
    }
  } catch (error) {
    console.error("error found in POSTING:", error);
  }

}

async function loginUser() {
  try {
    let data = await fetch("http://65.0.199.81:5000/chat/getUser");
    if (data) {
      userId = await data.json();
      socket.emit("create-room", userId);
    }
  } catch (error) {
    console.error(error);
  }
}
loginUser();

sentBtn.addEventListener("click", async () => {
  let messageField = document.getElementById("sendMsg");
  let message = messageField.value.trim();
  messageField.value = "";
  if (message) {
    let chatBox = document.getElementById("chatBox");
    let li = document.createElement("li");
    li.classList.add("sent");
    li.textContent = message;
    chatBox.appendChild(li);
    socket.emit("private-chat", { message, receiverId });
    try {
      let id = chatId;
      console.log("chatId :",chatId);
      
      let response = await fetch("http://65.0.199.81:5000/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, id }),
      });
      if (!response.ok) {
        console.log('message and is not send...');
      }
      console.log("Message and id is sended successfully...");
    } catch (error) {
      console.error("post message found some error", error);
    }
  }
});

let chat = document.getElementById("chat-area");
chat.addEventListener("click", async (e) => {
  if (e.target.id === "createGpBtn") {
    let groupBox = document.getElementById("group-create-container");
    groupBox.style.display = "block";
  } else if (e.target.id === "closs") {
    let groupBox = document.getElementById("group-create-container"); 
    groupBox.style.display = "none"; 
  }else if (e.target.id === "finalCreateBtn"){
    document.getElementById('group-create-container').style.display='none';
    let groupNameInput = document.getElementById('groupNameInput').value

    if(groupMembers.length >= 2){
      if(groupNameInput){
        console.log('groupname is getted');
        
        postGpDtl(groupMembers,groupNameInput,userId)
      }else{
        console.log('group name is not found');
        
      }
      groupMembers = null
      groupNameInput = null 
    }
     }else if (e.target.id === "groups"){
    let data;
    let result;
    try {
        data = await fetch("http://65.0.199.81:5000/chat/groups");
        if (data) {
            result = await data.json();
        }
    } catch (error) {
        console.error(error);
    }

    let allGroups = document.getElementById('allGroups');
    allGroups.innerHTML = "";  

    result.forEach(item => {
        let li = document.createElement("li");
        li.classList.add("grpLi");
        li.innerHTML = "Group: "+item.name;
        li.addEventListener('click',async function() {
           document.getElementById('chatBox').innerHTML=''
          try {
            let data = { id: item._id };
            console.log("enter into post");
            
            let result = await fetch("http://65.0.199.81:5000/chat/returnmsg", {
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });
            let response = await result.json();
            if (response) {
               console.log(response);
               response.messages.forEach((msg) => {
              if(userId.toString() === msg.senderId._id.toString()){
                console.log('true');
                let chatBox = document.getElementById('chatBox')
                let li = document.createElement('li')
                li.classList.add("sent");
                li.innerHTML= "You: "+msg.content
                chatBox.appendChild(li)
              }else{
                let chatBox = document.getElementById('chatBox')
                let li = document.createElement('li')
                li.classList.add("receiver");
                li.innerHTML= msg.senderId.username+":" +msg.content
                chatBox.appendChild(li)
              }
            }); 
              chatId = response.id;
            }
          } catch (error) {
            console.error("error found in POSTING:", error);
          }
          socket.on("groupmsg", (data) => {
            if (userId != data.sender) {
              let chatBox = document.getElementById("chatBox");
              chatBox.style.display='block'
              let li = document.createElement("li");
              li.classList.add("receiver");
              li.innerHTML = data.message;
              receiverMessage = data.message;
              chatBox.appendChild(li);
          }
          })
          startChatWithGroup(item._id, item.name);
          allReceiver(item._id)

      });
        allGroups.appendChild(li);
    });
}
});

async function startChatWithGroup(id, groupName) {
  receiverName.style.display = " block";
  receiverName.innerHTML = groupName;
  document.getElementById("sendMsg").style.display = "none";
  document.getElementById("sentBtn").style.display = "none";
  let gpsentBtn = document.getElementById("gpsentBtn")
  document.getElementById("gpsendMsg").style.display = "block";
  gpsentBtn.style.display = "block";
  gpsentBtn.addEventListener('click',async(e)=>{
    let message = document.getElementById("gpsendMsg").value
    document.getElementById("gpsendMsg").value = ""
    if(message){
    let chatBox = document.getElementById("chatBox");
    chatBox.style.display='block'
    let li = document.createElement("li");
    li.classList.add("sent");
    li.innerHTML = message;
    chatBox.appendChild(li);
      socket.emit('GroupChat', { message, usersArray });
      console.log("message send successfully...");
      try {
        let response = await fetch("http://65.0.199.81:5000/chat/groupmsg", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({id,message}),
        });
        console.log("message posted successfully...");
        
      } catch (error) {
        console.error(error,'error found in group message post');
        
      }
    }
  })

}

async function allReceiver(id) {
  let gpMId ={id : id}
  console.log("id getted to post",id);
  try{
    let response = await fetch('http://65.0.199.81:5000/chat/groupmembers',{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gpMId),
    });
    if(response){
      let fullDetails = await response.json()
      usersArray = await fullDetails.users;
      console.log(usersArray);
    }
      console.log('groupdetails posted sucessfully...');
    } catch (error) {
      console.error("post message found some error", error);
    }
}

function groupdetails(id,username){
  console.log('group details working');
  groupMembers.push({id,username})
  console.log(groupMembers,'array is working');
}

async function postGpDtl(groupdetail,groupnm,lUser) {
 let data = {groupdetail,groupnm,lUser}
 gpreceiverId = groupMembers.map(member => member.id);
 
 console.log(data,"data getted");
 
  try{
  let response = await fetch('http://65.0.199.81:5000/chat/groupChat',{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
    console.log('groupdetails posted sucessfully...');
  } catch (error) {
    console.error("post message found some error", error);
  }
}




