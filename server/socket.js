const http = require("http");
const io = require("socket.io");

const ReservationService = require('./service/ReservationService');


const ioServer = http.createServer();
const ioInstance = io(ioServer, {
  cors: {
    origin: "*",
  },
});

ioInstance.on('connection', (socket) => {
   console.log('New client connected');
 
   socket.on('message', async (data) => {
      const reservations = await ReservationService.getAllReservations();
      ioInstance.emit('message', JSON.stringify(reservations)); 
   });
 
   socket.on('disconnect', () => {
     console.log('Client disconnected');
   });
});

const port = process.env.PORT || 3002;
ioServer.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});