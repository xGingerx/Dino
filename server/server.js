const express = require('express');
const cors = require('cors');
const ReservationController = require('./controller/ReservationController');
const UserController = require('./controller/UserController')

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/users', UserController);
app.use('reservations', ReservationController)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
