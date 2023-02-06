///////////////////////////////////////////////
///////////// IMPORTS + VARIABLES /////////////
///////////////////////////////////////////////

const CONSTANTS = require('./utils/constants.js');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Constants
const { PORT, MAX_TIME, CLIENT, SERVER } = CONSTANTS;

// Application Variables;
let nextPlayerIndex = 0;
let playersArray = new Array(4).fill(false);

///////////////////////////////////////////////
///////////// HTTP SERVER LOGIC ///////////////
///////////////////////////////////////////////

// Create the HTTP server
const server = http.createServer((req, res) => {
  // get the file path from req.url, or '/public/index.html' if req.url is '/'
  const filePath = req.url === '/' ? '/public/index.html' : req.url;

  // determine the contentType by the file extension
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';

  // pipe the proper file to the res object
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(`${__dirname}/${filePath}`, 'utf8').pipe(res);
});

///////////////////////////////////////////////
////////////////// WS LOGIC ///////////////////
///////////////////////////////////////////////

// TODO: Create the WebSocket Server (ws) using the HTTP server

const wServer = new WebSocket.Server({ server: server });

// TODO: Define the websocket server 'connection' handler
wServer.on('connection', (socket) => {
  console.log('We have a connection!');
  // TODO: Define the socket 'message' handler
  socket.on('message', (data) => {
    const userData = JSON.parse(data);
    console.log(userData);
    switch (userData.type) {
      // 'NEW_USER' => handleNewUser(socket)
      case CLIENT.MESSAGE.NEW_USER:
        console.log('new user!');
        handleNewUser(socket);
        break;
      case CLIENT.PASS_POTATO:
        passThePotatoTo(userData.payload.newPotatoHolderIndex);
        break;
      default:
        console.log("I don't know this type🤖")
        break;
    }
  });
  socket.on('close', ()=> {
    playersArray[socket.id] = false;
    console.log(socket.id, "disconected");
  })
});

// 'PASS_POTATO' => passThePotatoTo(newPotatoHolderIndex)

///////////////////////////////////////////////
////////////// HELPER FUNCTIONS ///////////////
///////////////////////////////////////////////

// TODO: Implement the broadcast pattern
function broadcast(data, socketToOmit) {
  //Данные об игре должны транслироваься только игрокам который в этой игре находятся.
  wServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== socketToOmit) {
      client.send(JSON.stringify(data));
    }
  });
}

function handleNewUser(socket) {
  // Until there are 4 players in the game....
  console.log(`we have ${wServer.clients.size}`);
  const nextID = playersArray.findIndex(player => !player);
  if(nextID != -1) {
    socket.id = nextID;
    playersArray[nextID] = socket;
    // TODO: Send PLAYER_ASSIGNMENT to the socket with a clientPlayerIndex
    socket.send(
      JSON.stringify({
        type: SERVER.MESSAGE.PLAYER_ASSIGNMENT,
        payload: { clientPlayerIndex: nextID },
      })
    );
    // If they are the 4th player, start the game  
    if(nextID === 3) {
      // Choose a random potato holder to start
      const randomFirstPotatoHolder = Math.floor(Math.random() * 4);
      passThePotatoTo(randomFirstPotatoHolder);

      // Start the timer
      startTimer();
    }
  }
  // If 4 players are already in the game...
  else {
    // TODO: Send GAME_FULL to the socket
    socket.send(
      JSON.stringify({
        type: SERVER.MESSAGE.GAME_FULL,
      })
    );
  }
}

function passThePotatoTo(newPotatoHolderIndex) {
  // TODO: Broadcast a NEW_POTATO_HOLDER message with the newPotatoHolderIndex
  broadcast({
    type: SERVER.BROADCAST.NEW_POTATO_HOLDER,
    payload: { newPotatoHolderIndex },
  });
}

function startTimer() {
  // Set the clock to start at MAX_TIME (30)
  let clockValue = MAX_TIME;

  // Start the clock ticking
  const interval = setInterval(() => {
    if (clockValue > 0) {
      // TODO: broadcast 'COUNTDOWN' with the clockValue
      broadcast({
        type: SERVER.BROADCAST.COUNTDOWN,
        payload: {
          clockValue
        }
      })
      // decrement until the clockValue reaches 0
      clockValue--;
    }

    // At 0...
    else {
      clearInterval(interval); // stop the timer
      playersArray.forEach((player, idx) => {
        playersArray[idx] = false;
      })// reset the players index

      // TODO: Broadcast 'GAME_OVER'
      broadcast({
        type: SERVER.BROADCAST.GAME_OVER
      })
    }
  }, 1000);
}

// Start the server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});
