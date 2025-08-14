// controllers/tasksController.js
const Task = require('../models/Task');
const User = require('../models/User');

function computeFine(title = '', desc = '') {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes('speed') || text.includes('overspeed')) return 200;
  if (text.includes('red') && text.includes('light'))       return 300;
  if (text.includes('parking'))                             return 100;
  return 150;
}

function genChallanNo() {
  const rand = Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
  return `CH-${Date.now().toString().slice(-6)}-${rand}`;
}

exports.list = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const data = await Task.find(filter).sort({ createdAt: -1 });
    return res.json(data);
  } catch (err) {
    console.error('[tasks.list] error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, date, deadline, driverId, plate, fine } = req.body;

    let ownerId = driverId;
    if (plate) {
      const normalizedPlate = String(plate).trim().toUpperCase();
      const driver = await User.findOne({ role: 'driver', plate: normalizedPlate });
      if (!driver) {
        return res.status(404).json({ message: `Driver with plate ${normalizedPlate} not found` });
      }
      ownerId = driver._id;
    }
    if (!ownerId) {
      return res.status(400).json({ message: 'Either plate or driverId is required' });
    }

    const fineAmount = Number.isFinite(Number(fine))
      ? Number(fine)
      : computeFine(title, description);

    const doc = await Task.create({
      title,
      description,
      date,
      deadline,
      owner: ownerId,
      issuedBy: req.user._id,
      status: 'issued',
      fineAmount,
      challanNo: genChallanNo(),
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error('[tasks.create] error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { fine, title, description } = req.body;

    const updates = { ...req.body };

    if (Number.isFinite(Number(fine))) {
      updates.fineAmount = Number(fine);
    } else if ((typeof title === 'string') || (typeof description === 'string')) {
      const old = await Task.findById(req.params.id);
      if (!old) return res.status(404).json({ message: 'Not found' });

      const newTitle = typeof title === 'string' ? title : old.title;
      const newDesc  = typeof description === 'string' ? description : old.description;
      updates.fineAmount = computeFine(newTitle, newDesc);
    }

    const doc = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('[tasks.update] error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const r = await Task.deleteOne({ _id: req.params.id });
    if (!r.deletedCount) return res.status(404).json({ message: 'Not found' });
    return res.status(204).end();
  } catch (err) {
    console.error('[tasks.remove] error:', err);
    return res.status(500).json({ message: err.message });
  }
};
