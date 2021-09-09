const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').createServer(app)


const io = require("socket.io")(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    },
});

app.use(cors());

const PORT = process.env.PORT || 4000;

app.get("/",(req,res)=>{
    res.send("running")
})


io.on("connection",(socket)=>{
    socket.emit("me",socket.id);
    socket.on("calluser",({
        userToCall,signalData, from, name
    })=>{
        io.to(userToCall).emit("callUser",{
            signal:signalData,
            from,
            name,
        });
    });

    socket.on("updateMyMedia",({type, currentMediaStatus })=>{
        console.log("updateMyMedia");
        socket.broadcast.emit("updateUserMedia",{type, currentMediaStatus})
    });

    socket.on("msgUser",({
        name,to,msg,sender
    })=>{
        io.to(to).emit("msgRcv",{name, msg, sender});
    });

    socket.io("answerCall", (data)=>{
        socket.broadcast.emit("updateUserMedia",{
            type:data.type,
            currentMediaStatus: data.myMediaStatus
        });
        io.to(data.to).emit("callAccepted",data);
    });
    socket.on("endCall",({id})=>{
        io.to(id).emit("endCall");
    });
});

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
