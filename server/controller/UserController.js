const express = require('express');
const UserService = require('../service/UserService.js')
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
const UserController = express.Router();
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../firebase/firebase');


UserController.post('/create', async (req, res)=>{
    try {
        const user = await UserService.findOrCreateUser(req.body);
        console.log(user)
        res.status(200).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
})

UserController.post('/update', async (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    
    if (!email || !displayName) {
      return res.status(400).json({ error: 'Email and displayName are required' });
    }

    const updatedUser = await UserService.updateUser(email, displayName, photoURL);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});


UserController.post('/uploadImage', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer } = req.file;
    const email = req.body.email;
    
    const storageRef = ref(storage, `profile_pics/${email}`);
    const snapshot = await uploadBytes(storageRef, buffer);
    const photoURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ photoURL });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
});


UserController.post('/get', async (req, res) => {
    try {
      const email = req.body.email;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const user = await UserService.getUserByEmail(email);
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: error.message });
    }
});

module.exports = UserController

