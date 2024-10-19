const mongoose = require("mongoose");
const user=require("./user.model")
const adminSchema = new mongoose.Schema({
 
},{discriminatorKey:"role"});


module.exports = user.discriminator('admin', adminSchema);
