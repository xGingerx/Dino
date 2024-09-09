const express = require('express');
const cors = require('cors');
const http = require("http").createServer();
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

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

io.on('connection', (socket) => {
   console.log('New client connected');
 
   socket.on('message', async (data) => {
      const reservations = await ReservationService.getAllReservations();
      io.emit('message', JSON.stringify(reservations)); 
   });
 
   socket.on('disconnect', () => {
     console.log('Client disconnected');
   });
 });


http.listen(3002, () => {
   console.log(`Server is running at http://localhost:${3002}`);
 });

/* const ws_port = 3002

const wss = new WebSocket.Server({ port: ws_port });

wss.on("connection", (ws) => {
    console.log("Client connected");
    const getReservations = async () => {
      if (ws.readyState === WebSocket.OPEN) {
         const reservations = await ReservationService.getAllReservations();
         console.log(reservations)
         ws.send(reservations.toString());
      }
   };
    let timer = setInterval(getReservations , 10000);

    ws.on("close", () => {
        console.log("Client disconnected");
        clearInterval(timer);
     });
})


console.log(`WebSocket server listening on port ${ws_port}`); */