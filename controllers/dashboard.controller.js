const Url = require('../models/Url');

exports.getUserUrls = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user.id };
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Get URLs with pagination
    const urls = await Url.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-clickData');

    // Get total count
    const total = await Url.countDocuments(query);

    // Format response
    const formattedUrls = urls.map(url => ({
      id: url._id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt
    }));

    res.json({
      success: true,
      urls: formattedUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total URLs
    const totalUrls = await Url.countDocuments({ user: userId });

    // Get total clicks
    const totalClicks = await Url.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);

    // Get recent clicks (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentClicks = await Url.aggregate([
      { $match: { user: userId, 'clickData.timestamp': { $gte: weekAgo } } },
      { $unwind: '$clickData' },
      { $match: { 'clickData.timestamp': { $gte: weekAgo } } },
      { $group: { 
        _id: { 
          $dateToString: { format: '%Y-%m-%d', date: '$clickData.timestamp' } 
        }, 
        clicks: { $sum: 1 } 
      }},
      { $sort: { '_id': 1 } }
    ]);

    // Get top URLs by clicks
    const topUrls = await Url.find({ user: userId })
      .sort({ clicks: -1 })
      .limit(5)
      .select('shortCode originalUrl clicks');

    res.json({
      success: true,
      stats: {
        totalUrls,
        totalClicks: totalClicks[0]?.total || 0,
        recentClicks,
        topUrls
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};