const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  contactPerson: {
    type: String
  },
  contactPhone: {
    type: String
  },
  address: {
    type: String
  },
  businessScope: {
    type: String
  },
  qualification: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Supplier', SupplierSchema);