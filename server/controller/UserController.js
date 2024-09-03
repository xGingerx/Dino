const express = require('express');
const UserService = require('../service/UserService.js')
const User = require('../entity/user');


const UserController = express.Router();

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

UserController.post('/update', async (req, res)=>{
    try {
        const user = new User(req.body)  
        const updatedUser = await UserService.updateUser(user);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }

})

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

UserController.post('/delete', async (req, res)=>{
    try {
        await UserService.deleteUserByEmail(req.body.email);
        res.status(200).json({ message: `User with email ${email} successfully deleted` });
      } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
      }

})

module.exports = UserController

