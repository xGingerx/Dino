const { initializeApp } = require('firebase/app');
const { query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getFirestore, deleteField } = require('firebase/firestore');

const { getStorage } = require('firebase/storage');
const firebaseConfig = require('./firebase-config');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const dbReservations = collection(db, 'reservations');
const dbUsers = collection(db, 'users');

module.exports = { query, where, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, deleteField, dbReservations, dbUsers, storage };
