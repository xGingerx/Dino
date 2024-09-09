const express = require('express');
const WebSocket = require('ws')
const cors = require('cors');
const ReservationController = require('./controller/ReservationController');
const UserController = require('./controller/UserController')
const ReservationService = require('./service/ReservationService');

const app = express();
const port = process.env.PORT || 3000;
const reservationService = new ReservationService();

reservationService.startAutoReservationManagement();

app.use(express.json());
app.use(cors());

app.use('/users', UserController);
app.use('/reservations', ReservationController)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const ws_port = 3002
const DEFAULT_INTERVAL = 1000;

const wss = new WebSocket.Server({ port: ws_port });

wss.on("connection", (ws) => {
    console.log("Client connected");
    let timer = setInterval(generateRandomNumbers, DEFAULT_INTERVAL);

    const generateRandomNumbers = () => {
        if (ws.readyState === WebSocket.OPEN) {
           const randomValue = Math.floor(Math.random() * 100);
           ws.send(randomValue.toString());
        }
     };

    ws.on("message", (message) => {
        const newInterval = JSON.parse(message);
        console.log(`New interval: ${newInterval} second(s)`);
        if (!isNaN(newInterval) && newInterval > 0) {
           clearInterval(timer);
           timer = setInterval(generateRandomNumbers, newInterval * 1_000);
        }
     });


    ws.on("close", () => {
        console.log("Client disconnected");
        clearInterval(timer);
     });
})


console.log(`WebSocket server listening on port ${ws_port}`);