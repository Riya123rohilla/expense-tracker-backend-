const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getStats
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.get('/stats/summary', getStats);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
