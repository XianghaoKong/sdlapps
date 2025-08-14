// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title:      { type: String, required: true },          
  description:{ type: String },                          
  date:       { type: Date },                           
  deadline:   { type: Date },                            
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  issuedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  status:     { type: String, enum: ['issued','paid','cancelled','draft'], default: 'issued' },
  fineAmount: { type: Number, default: 0 },
  challanNo:  { type: String }                          
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
