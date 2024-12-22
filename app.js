const express=require("express");
const socket=require("socket.io");
const http=require("http");
const{Chess}=require("chess.js");
const path=require("path");

const app=express();
const server=http.createServer(app);
// const server=app.listen(PORT,()=>console.log(`server on port${PORT}`))

const io = socket(server);
let socketsConnected=new Set();
const chess=new Chess();
let players={}
let currentPlayer="w";

app.set("view engine" ,"ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/", function(req,res){
    res.render("index" ,{title:"Chess Game"});
});
io.on("connection",function(usocket /*single client connected */){
    console.log("connection established");
    if(!players.white){
        players.white=usocket.id;
        usocket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black=usocket.id;
        usocket.emit("playerRole","b");
    }
    else{
        usocket.emit("spectatorRole");
    }
    usocket.on("disconnect" ,function(){
        if(usocket.id == players.white){
            delete players.white;
        }
        else if(usocket.id == players.black){
            delete players.black;
        }
    })

    usocket.on("move" ,function(move){
        try{
            if(chess.turn()==="w" && usocket.id!==players.white )return;
            if(chess.turn()==="b" && usocket.id!==players.black )return;
            const result=chess.move(move);
            if(result){
                currentPlayer=chess.turn();
                io.emit("move",move);
                io.emit("boardstate",chess.fen())
                // console.log(move);
            }
            else{
                console.log("Invalid move:", move);
                usocket.emit("Invalid move:", move);
            }
        }
        catch(e){
            console.log(e);
            console.log("Invalid move:", move);   
        }
    });
})

server.listen(4000,()=>{
    console.log("listening on port 4000");
});

  



