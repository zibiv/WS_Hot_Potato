# Hot Potato

A WebSockets application demo.

## Rules

* Upon connecting to the server, choose a name. This name will be displayed to other players at the start of the game. Your own player will show the text "You".
* Once the 4th player has joined the game, the game will start and the clock will begin counting down from 30.
* When the game starts, one player will be chosen randomly to hold the potato.
* If you are holding the potato, click on another player to pass the potato.
* If you are holding the potato when the time is up, you will lose!
* Only 4 players may join a game.

Because the focus of this project is on WebSockets (and not on software engineering more broadly), we’ve encapsulated the majority of the game logic and DOM manipulation in various helper functions.

Your task is to implement the WebSocket logic to pass messages between the server and clients and to call the provided game logic helper functions in response to these messages. In addition to reinforcing the mechanics of connecting a WebSocket server and client, this project will help demonstrate the process of designing a system of messages and payloads sent between clients and the server.
