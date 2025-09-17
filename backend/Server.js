const express = require('express');
const app = express();
const port = 8080;
const db = require("./config/db")
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const fileRoutes = require('./routes/fileRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use(cors());
app.use(express.json());

dotenv.config();

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/files', fileRoutes);

app.listen(port,(err)=>{
    if(!err){
        db();
        console.log(`Server running on http://localhost:${port}`);
    }
})