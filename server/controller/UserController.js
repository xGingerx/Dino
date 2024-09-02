const express = require('express');
const service = require('../service/UserService.js')


const UserController = express.Router();

UserController.post('/create', (req, res)=>{
    res.send({msg:"Create user activated"})
    service.create()
})

UserController.post('/update', (req, res)=>{
    res.send({msg:"Update user activated"})

})

UserController.post('/get', (req, res)=>{
    res.send({msg:"Get user activated"})
})

UserController.post('/delete', (req, res)=>{
    res.send({msg:"Delete user activated"})

})

module.exports = UserController

