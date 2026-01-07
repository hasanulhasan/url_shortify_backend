const crypto = require('crypto');
const Url = require('../models/Url');
const User = require('../models/User');

/**
 * Generate a URL-safe random short code
 */
const generateShortCode = (length = 6) => {
  return crypto
    .randomBytes(Math.ceil(length * 0.75))
    .toString('base64url') // URL-safe
    .slice(0, length);
};

/**
 * Normalize URL (ensure protocol exists)
 */
const normalizeUrl = (url) => {
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
};

/**
 * CREATE / SHORTEN URL
 */
exports.shortenUrl = async (req, res) => {
  try {
    let { originalUrl, customCode } = req.body;
    const userId = req.user.id;

    originalUrl = normalizeUrl(originalUrl);

    // Check user's URL limit
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.tier === 'free' && user.urlCount >= 100) {
      return res.status(403).json({
        message: 'URL limit reached. Please upgrade to premium.',
        limitReached: true
      });
    }

    let url = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    // Try to create a unique short URL
    while (!url && attempts < MAX_ATTEMPTS) {
      try {
        const shortCode = customCode || generateShortCode(6);

        url = await Url.create({
          shortCode,
          originalUrl,
          user: userId
        });
      } catch (err) {
        // Duplicate shortCode
        if (err.code === 11000) {
          if (customCode) {
            return res.status(400).json({
              message: 'Custom code already exists'
            });
          }
          attempts++;
        } else {
          throw err;
        }
      }
    }

    if (!url) {
      return res.status(500).json({
        message: 'Failed to generate a unique short URL'
      });
    }

    // Increment user's URL count
    await User.findByIdAndUpdate(userId, {
      $inc: { urlCount: 1 }
    });

    res.status(201).json({
      success: true,
      url: {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
        createdAt: url.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * REDIRECT SHORT URL
 */
exports.redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Track click
    await Url.updateOne(
      { _id: url._id },
      {
        $inc: { clicks: 1 },
        $push: {
          clickData: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            referrer: req.get('Referrer') || 'direct'
          }
        }
      }
    );

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET URL STATS
 */
exports.getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({
      shortCode,
      user: req.user.id
    }).select('-clickData._id');

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json({
      success: true,
      url: {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        createdAt: url.createdAt,
        clickData: url.clickData
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE URL
 */
exports.deleteUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOneAndDelete({
      shortCode,
      user: req.user.id
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Decrement user's URL count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { urlCount: -1 }
    });

    res.json({
      success: true,
      message: 'URL deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
