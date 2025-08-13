const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/tasksController');

router.get('/', protect, ctrl.list);         // GET /api/tasks
router.post('/', protect, ctrl.create);      // POST /api/tasks
router.put('/:id', protect, ctrl.update);    // PUT /api/tasks/:id
router.delete('/:id', protect, ctrl.remove); // DELETE /api/tasks/:id

module.exports = router;
