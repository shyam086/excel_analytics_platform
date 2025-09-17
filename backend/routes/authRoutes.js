const authController = require('../controllers/authController');
const express = require('express');
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  createNewPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);             
router.post('/login', login);                   
router.post('/forgot-password', sendOtp);       
router.post('/verify-otp', verifyOtp);          
router.post('/create-new-password', createNewPassword); 
router.post('/new-password', authController.createNewPassword);


module.exports = router;
