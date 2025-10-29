const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Food',
      'Transport',
      'Shopping',
      'Entertainment',
      'Bills',
      'Health',
      'Education',
      'Other',
      'Salary',
      'Freelance',
      'Investment',
      'Gift'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  familyMember: {
    type: String,
    trim: true,
    maxlength: [50, 'Member name cannot be more than 50 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, type: 1 });
ExpenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
