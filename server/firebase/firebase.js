const { initializeApp } = require('firebase/app');
const { query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getFirestore, deleteField } = require('firebase/firestore');

const { getStorage } = require('firebase/storage');
const firebaseConfig = require('./firebase-config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Define Firestore collections
const dbReservations = collection(db, 'reservations');
const dbUsers = collection(db, 'users');

module.exports = { query, where, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, deleteField, dbReservations, dbUsers, storage };
