// backend/controllers/tasksController.js
const Task = require('../models/Task');

exports.list = async (req, res) => {
  try {
    // 如果用了 protect，中间件会把用户放到 req.user
    const userId = req.user?._id;
    const data = await Task.find(userId ? { owner: userId } : {})
      .sort({ createdAt: -1 });

    // 前端期望数组，这里直接返回数组
    return res.json(data);
  } catch (err) {
    console.error('[tasks.list] error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user?._id;
    const doc = await Task.create({ ...req.body, owner: userId });
    return res.status(201).json(doc);
  } catch (err) {
    console.error('[tasks.create] error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user?._id;
    const doc = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('[tasks.update] error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user?._id;
    const r = await Task.deleteOne({ _id: req.params.id, owner: userId });
    if (!r.deletedCount) return res.status(404).json({ message: 'Not found' });
    return res.status(204).end();
  } catch (err) {
    console.error('[tasks.remove] error:', err);
    return res.status(500).json({ message: err.message });
  }
};
