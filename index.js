const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('../monkey/pri')

const app = express();
const server = http.createServer(app);
dotenv.config();
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',  // Use your frontend URL here like "http://localhost:3000" in dev
    methods: ['GET', 'POST'],
    credentials: true,
  }
});


app.use(cors());
app.use(express.json());
app.get('/ayush1234', (req, res) => {
  res.send('Ayush server is live 🚀');
});


let waitingUser = null;
const rooms = {};
const userSocketMap = new Map();
const socketUserMap = new Map();  

console.log("Waiting user before match:", waitingUser);


io.on('connection', (socket) => {
  // userconnected once on page load
  console.log('👤 User connected:', socket.id);
  socket.on("userConnected",({userId})=>{
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
    userSocketMap.set(userId, socket.id);
    socketUserMap.set(socket.id, userId);
    io.emit("numOnline", userSocketMap.size);
  });
socket.emit("socketId", socket.id);

socket.on("fuckyou",(data)=>{
  console.log("🔥🔥🔥🔥🔥🔥🔥🔥",data);
  
})




// friendonline
socket.on("friendOnline",({userId})=>{
const friendSocketId = userSocketMap.get(userId);
if(friendSocketId){
  socket.emit("friendOnline",{userId});
}
})







socket.on("skip", ({ peerId }) => {
  const peerSocket = io.sockets.sockets.get(peerId);
  if (peerSocket) {
    peerSocket.emit("peerSkipped");
  }
});
socket.on("sig",()=>{
  console.log("🌍🌍🌍🌍🌍🔞🫰🏽📞✔️✖️");
})

socket.on("signal", ({ peerId, signalData}) => {
    const socketId=socket.id;
  console.log("🌍 Received signal from", socketId, "to", peerId);
  const targetSocket = io.sockets.sockets.get(peerId);
if (!targetSocket) {
  console.error("❌ No socket found for peerId:", peerId);
  return;
}
  // io.to(peerId).emit("signal", {
  //   peerId: socket.id
  //   ,
  //   signalData,
  // })
  targetSocket.emit("signal", {
    peerId: socket.id, // ID of sender
    signalData,
  });
});
  //chat+videoroom+random

  socket.on("userReady",()=>{
    console.log('😄😄😄😄');
    
    const socketId = socket.id;
  if (waitingUser && waitingUser !== socketId && io.sockets.sockets.get(waitingUser)) {

    console.log('✅ Matched with:', waitingUser);
    const roomId = generateRoomId(socketId, waitingUser);
    console.log("🔞🔞🔞",roomId);
   
    socket.join(roomId);
    io.sockets.sockets.get(waitingUser)?.join(roomId);
    socket.emit("roomId", roomId);
    io.to(waitingUser).emit("roomId", roomId);
    socket.emit("match",  waitingUser );
    console.log("✉️✉️✉️");
    
    
    io.to(waitingUser).emit("match", socketId );
    console.log("🌆🌆🌆🌆");
    
    // socket.emit("match", { peerId: waitingUser, initiator: true });   // This socket will initiate
    // io.to(waitingUser).emit("match", { peerId: socketId, initiator: false }); // This one responds

    waitingUser = null;
    console.log("💬💬💬💬💬");
    
  }
  else {
    if (!waitingUser) { // Only set if not already waiting
      waitingUser = socketId;
      console.log('⏳ Waiting for a match...');
    }
  }
  
})
// common for random +friend
  


  socket.on("sendMessagewithvideo", async ({ receiverId, senderId, content }) => {
    console.log(receiverId, senderId, content);
console.log("🔞🔞🔞🫰🏽🫰🏽🌆",receiverId, senderId, content);
    if (!receiverId || !senderId || !content) return;
    console.log("Sending message:", { receiverId, senderId, content });
    const roomId = [receiverId, senderId].sort().join("-");
    console.log(roomId);

    try {
      io.to(roomId).emit("recievemessagewithvideo",
        {

          content,
          senderId,
          receiverId



        }

      )

    } catch (error) {
      console.error("Error sending message:", error);
    }


  })
  socket.on("findNext", () => {
    if (waitingUser === socket.id) waitingUser = null;
console.log("📞📞📞📞📞",waitingUser,socket.id);
    if (waitingUser && waitingUser !== socket.id && io.sockets.sockets.get(waitingUser)) {
      const roomId = generateRoomId(socket.id, waitingUser);
      socket.join(roomId);
      io.sockets.sockets.get(waitingUser)?.join(roomId);
      socket.emit("match", { peerId: waitingUser });
      io.to(waitingUser).emit("match", { peerId: socket.id });
      waitingUser = null;
    } else {
      waitingUser = socket.id;
      console.log("⏳ Waiting for next match...");
    }
  });

socket.on("findClerkId",(socketId)=>{
const clerkId=socketUserMap.get(socketId);
console.log("ReportedId",clerkId);
socket.emit("getClerkId",(clerkId));

})

  // chat+videoroom+friend

  socket.on("join-room2", ({ roomId, userId }) => {
    console.log("🪙RoomId",roomId);
    console.log("✔️UserId",userId);
    const socketId=userSocketMap.get(userId);
    console.log("🪙SocketId",socketId);
    const parts=roomId.split("-");
    const senderSocketId=parts[0];
    console.log("🪙SenderSocketId",senderSocketId);
    
    const receiverSocketId=parts[1];
    console.log("🪙ReceiverSocketId",receiverSocketId);
    if(senderSocketId===socketId){
      socket.join(roomId);
      io.sockets.sockets.get(receiverSocketId)?.join(roomId);
      console.log("Sender joined room 🫰🏽🫰🏽🫰🏽😄❌",roomId);
    }
    else{
      socket.join(roomId);
      io.sockets.sockets.get(senderSocketId)?.join(roomId);
      console.log("Receiver joined room 🔞✉️✉️✉️🫰🏽",roomId);
    }

    
      io.to(senderSocketId).emit("matchwithfriend", { peerId: receiverSocketId });
     io.to(receiverSocketId).emit("matchwithfriend", { peerId: senderSocketId });
     console.log("Match with friend 🔞🌆🌆💬💬💬💬💬😄😄🌍",senderSocketId,receiverSocketId);

   
  });

  socket.on("endcall", ({ roomId }) => {
    const parts=roomId.split("-");
    const senderSocketId=parts[0];
    const receiverSocketId=parts[1];
    if(senderSocketId===socket.id){
      socket.emit("endcall2", { roomId });
      console.log("Receiver left room",roomId);
      io.to(receiverSocketId).emit("endcall2", { roomId });
      socket.leave(roomId);
      io.sockets.sockets.get(receiverSocketId)?.leave(roomId);
    }
    else{
      socket.emit("endcall2", { roomId });
      console.log("Sender left room",roomId);
      io.to(senderSocketId).emit("endcall2", { roomId });
      socket.leave(roomId);
      io.sockets.sockets.get(senderSocketId)?.leave(roomId);
    }

  });
 
  socket.on("signal2", ({ peerId, signalData }) => {
    console.log("🌍✖️❌✖️❌",peerId,signalData);
        io.to(peerId).emit("signal2", {
          peerId: socket.id
          ,
          signalData,
        })
      });





  socket.on("joinFriendRoom", ({ userId, friendId }) => {
    console.log("Joining room:", { userId, friendId });
    const roomId = generateRoomId(userId, friendId);
    socket.join(roomId);
    console.log("User joined room:", roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });
  socket.on('join-room', (roomId) => {


    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("sendCallRequest", async ({ receiverId, senderId }) => {

    if (!receiverId || !senderId) return;
    console.log("Sending call request:", { receiverId, senderId });
    
    const receiverSocketId = userSocketMap.get(receiverId);
    console.log(receiverSocketId);
    if(receiverSocketId){
    io.to(receiverSocketId).emit("callRequest", { receiverId, senderId });
    }
    else{
      socket.emit("user-offline", receiverId);
    }
  });



  socket.on("acceptCallRequest", async ({ receiverId, senderId }) => {
    if (!receiverId || !senderId) return;
    console.log("Sending call request:", { receiverId, senderId });
    // const roomId = [receiverId, senderId].sort().join("-");
    // console.log(roomId);

    // io.to(roomId).emit("callAccepted", { receiverId, senderId });
    
    // waitingUserFriend = userSocketMap.get(receiverId);
    const receiverSocketId = userSocketMap.get(receiverId);
    console.log(receiverSocketId);
const senderSocketId = userSocketMap.get(senderId);
    if(receiverSocketId&&senderSocketId){
     
      // const roomId = generateRoomId(socket.id, receiverSocketId);
      // socket.join(roomId);
      // io.sockets.sockets.get(receiverSocketId)?.join(roomId);
      // socket.emit("matchwithfriend", { peerId: receiverSocketId });
      // io.to(receiverSocketId).emit("matchwithfriend", { peerId: socket.id });

      io.to(userSocketMap.get(senderId)).emit("startCall", { roomId: `${senderSocketId}-${receiverSocketId}` });
      io.to(userSocketMap.get(receiverId)).emit("startCall", { roomId: `${senderSocketId}-${receiverSocketId}` });




      

    }
else{
  socket.emit("user-unavailable", receiverId);

}


  });

  socket.on("declineCallRequest", async ({ receiverId, senderId }) => {
    if (!receiverId || !senderId) return;
    console.log("Declining call request:", { receiverId, senderId });
    const senderSocketId = userSocketMap.get(senderId);
   
    io.to(senderSocketId).emit("callCut", { receiverId, senderId });

  });












  socket.on("sendMessage", async ({ receiverId, senderId, content,type }) => {
    if (!receiverId || !senderId || !content) return;
    console.log("Sending message:", { receiverId, senderId, content });
    const roomId = [receiverId, senderId].sort().join("-");
    try {
      // Save message to Supabase DB via Prisma
      const message = await db.messageWithFreinds.create({
        data: {
          content,
          type,
          senderId,
          receiverId,
          
        },
      });

      // Broadcast to all users in room
      io.to(roomId).emit("receiveMessage", {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        type: message.type,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });


  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    if (waitingUser === socket.id) waitingUser = null;
    io.emit("user-disconnected", socket.id);
    socket.broadcast.emit("user-disconnected", socket.id);
    for (const [userId, sockId] of userSocketMap.entries()) {
      if (sockId === socket.id) {
        userSocketMap.delete(userId);
        socketUserMap.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    // userSocketMap.delete(userId);
  });
});



function generateRoomId(user1, user2) {
  return [user1, user2].sort().join("-");
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}`);
});