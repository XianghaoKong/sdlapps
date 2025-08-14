const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware'); 
const { requireRole } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/tasksController');

router.get('/', protect, ctrl.list);                     
router.post('/', protect, requireRole('admin'), ctrl.create);
router.put('/:id', protect, requireRole('admin'), ctrl.update);
router.delete('/:id', protect, requireRole('admin'), ctrl.remove);

module.exports = router;
