const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  templateName: {
    type: String,
    required: true
  },
  purchaseProjectName: {
    type: String,
    required: true
  },
  purchaseOrgName: {
    type: String,
    required: true
  },
  purchaseContactPerson: {
    type: String,
    required: true
  },
  purchaseContactPhone: {
    type: String,
    required: true
  },
  purchaseMethod: {
    type: String,
    required: true
  },
  totalBudgetAmount: {
    type: Number,
    required: true
  },
  fundSource: {
    type: String,
    required: true
  },
  techRequirement: {
    type: String
  },
  allowImportGoods: {
    type: String
  },
  setMaxPriceLimit: {
    type: String
  },
  maxPriceAmount: {
    type: Number
  },
  quoteScope: {
    type: String
  },
  projectCode: {
    type: String
  },
  tendererName: {
    type: String
  },
  legalRepresentative: {
    type: String
  },
  issueDate: {
    type: Date
  },
  constructionLocation: {
    type: String
  },
  constructionScale: {
    type: Number
  },
  structureType: {
    type: String
  },
  serviceContent: {
    type: String
  },
  serviceLocation: {
    type: String
  },
  servicePeriod: {
    type: String
  },
  serviceStandards: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Requirement', RequirementSchema);