const firebase = require('firebase');
const firebaseConfig = require('./firebase-config')

firebase.initializeApp(firebaseConfig);  
// create/find database
const db = firebase.firestore();
// create/find collections
const dbReservations = db.collection("reservations");
const dbUsers = db.collection("users")

module.exports = {dbReservations, dbUsers};
