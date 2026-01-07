const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 8
  },
  originalUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  clickData: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    referrer: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
urlSchema.index({ shortCode: 1 });
urlSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Url', urlSchema);