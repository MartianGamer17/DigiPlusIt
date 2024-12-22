const socket=io();  
const chess=new Chess();
const boardElement=document.querySelector(".chessboard");
let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;

const renderBoard=function(){
    const board=chess.board();
    boardElement.innerHTML="";
    

    
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareIndex)=>{
            const squareElement=document.createElement("div");
            squareElement.classList.add("square",
                (rowindex+squareIndex)%2===0 ?"light":"dark"
            );

            squareElement.dataset.row = rowindex
            squareElement.dataset.col= squareIndex;

            if(square){
                const pieceElement=document.createElement("div");
                pieceElement.classList.add("piece",square.color==='w' ?"white" : "black");
                pieceElement.innerText=getPieceUnicode(square);
                pieceElement.draggable= playerRole===square.color;

                pieceElement.addEventListener("dragstart", function(e){
                    if(pieceElement.draggable){
                        
                        draggedPiece=pieceElement;
                        sourceSquare={row:rowindex,col:squareIndex};
                        e.dataTransfer.setData("text/plain","");
                         
                    }

                }); 

            pieceElement.addEventListener("dragend", (e)=>{
                 
                    draggedPiece=null;
                     sourceSquare=null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover",function(e){
                e.preventDefault(); 
            })

            squareElement.addEventListener("drop",function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource={
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),

                    };


                    handleMove(sourceSquare,targetSource);
                    
                }
            });

            boardElement.appendChild(squareElement);
            
        })
        
    });

    if(playerRole==="b"){
        boardElement.classList.add("flipped");
        
    }
    else{
        boardElement.classList.remove("flipped");
    }
};

const handleMove=function(source,target){
    const move={
        from:`${String.fromCharCode(97 + source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8-target.row}`,
        promotion: "q",
        
    }
    console.log(move);
    socket.emit("move",move);
};

const getPieceUnicode=function(piece){
    const unicodePieces={
        // p: "♙",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        p: "♟︎",
        // r: "♖",
        // n: "♘",
        // b: "♗",
        // q: "♕",
        // k: "♔"
    }

    return unicodePieces[piece.type] || "";
}; 

socket.on("playerRole",function(role){
    playerRole=role;
    renderBoard(); 
})

socket.on("spectatorRole",function(role){
    playerRole=null;
    renderBoard();
})

socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
})
socket.on("move",function(move){
    chess.move(move);
    renderBoard();
})
renderBoard(); 


// const socket=io()

