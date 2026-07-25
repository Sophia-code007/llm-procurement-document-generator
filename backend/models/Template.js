const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['goods', 'engineering', 'services'],
    required: true
  },
  categoryName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  templateId: {
    type: String,
    unique: true
  },
  chapters: [{
    name: String,
    fields: [{
      name: String,
      label: String,
      type: String,
      required: Boolean,
      placeholder: String,
      options: [String]
    }]
  }],
  isRecommended: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Template', TemplateSchema);