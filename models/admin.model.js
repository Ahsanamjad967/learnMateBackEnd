const mongoose = require("mongoose");
const User=require("./user.model")
const adminSchema = new mongoose.Schema({
 
},{discriminatorKey:"role"});


module.exports = User.discriminator('admin', adminSchema);
