const Expense = require('../models/Expense');

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { type, category, startDate, endDate, familyMember } = req.query;
    
    // Build query
    let query = { user: req.user._id };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (familyMember) query.familyMember = familyMember;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this expense'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    req.body.user = req.user._id;
    
    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this expense'
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this expense'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats/summary
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      byCategory: {},
      byMonth: {},
      recentTransactions: []
    };

    expenses.forEach(expense => {
      if (expense.type === 'income') {
        stats.totalIncome += expense.amount;
      } else {
        stats.totalExpense += expense.amount;
      }

      // Category stats
      if (!stats.byCategory[expense.category]) {
        stats.byCategory[expense.category] = 0;
      }
      stats.byCategory[expense.category] += expense.amount;

      // Monthly stats
      const month = new Date(expense.date).toISOString().substring(0, 7);
      if (!stats.byMonth[month]) {
        stats.byMonth[month] = { income: 0, expense: 0 };
      }
      if (expense.type === 'income') {
        stats.byMonth[month].income += expense.amount;
      } else {
        stats.byMonth[month].expense += expense.amount;
      }
    });

    stats.balance = stats.totalIncome - stats.totalExpense;
    stats.recentTransactions = expenses.slice(0, 10);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
