// controllers/tasksController.js
const Task = require('../models/Task');


function computeFine(title = '', desc = '') {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes('speed') || text.includes('overspeed')) return 200;
  if (text.includes('red') && text.includes('light'))       return 300;
  if (text.includes('parking'))                             return 100;
  return 150; 
}


function genChallanNo() {
  const rand = Math.floor(Math.random() * 1e6).toString().padStart(6,'0');
  return `CH-${Date.now().toString().slice(-6)}-${rand}`;
}


exports.list = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
  const data = await Task.find(filter).sort({ createdAt: -1 });
  res.json(data); 
};


exports.create = async (req, res) => {
  
  const { title, description, date, deadline, driverId } = req.body;
  if (!driverId) return res.status(400).json({ message: 'driverId is required' });

  const fine = computeFine(title, description);
  const challan = genChallanNo();

  const doc = await Task.create({
    title,
    description,
    date,
    deadline,
    owner: driverId,
    issuedBy: req.user._id,
    status: 'issued',
    fineAmount: fine,
    challanNo: challan
  });

  res.status(201).json(doc);
};


exports.update = async (req, res) => {
  const doc = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
};


exports.remove = async (req, res) => {
  const r = await Task.deleteOne({ _id: req.params.id });
  if (!r.deletedCount) return res.status(404).json({ message: 'Not found' });
  res.status(204).end();
};
