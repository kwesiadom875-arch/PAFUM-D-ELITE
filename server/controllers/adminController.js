const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Featured = require('../models/Featured');
const argon2 = require('argon2');

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../client/public/uploads');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'temp-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-m4v',
    'video/webm',
    'video/x-msvideo'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
}).single('video');

exports.uploadHeroVideo = (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    } else if (err) {
      if (err.message === 'Invalid file type. Only video files are allowed.') {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

    const tempPath = req.file.path;
    const outputFilename = `hero-${Date.now()}.mp4`;
    const outputPath = path.join(req.file.destination, outputFilename);
    const publicUrl = `/uploads/${outputFilename}`;

    // FFmpeg Re-encoding (All-Intra for smooth scrubbing)
    const ffmpeg = spawn('ffmpeg', [
      '-i', tempPath,
      '-c:v', 'libx264',
      '-x264-params', 'keyint=1:scenecut=0',
      '-c:a', 'copy',
      '-y',
      outputPath
    ]);

    ffmpeg.on('close', async (code) => {
      // Delete temp file
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch (e) { console.error("Error deleting temp file:", e); }

      if (code === 0) {
        try {
          // Update Featured document
          let featured = await Featured.findOne().sort({ _id: -1 });
          if (!featured) {
            featured = new Featured({ 
                name: 'Default', 
                tagline: 'Default', 
                description: 'Default', 
                image: '/images/halfeti.png',
                videoUrl: publicUrl 
            });
          } else {
            featured.videoUrl = publicUrl;
          }
          await featured.save();

          res.json({ message: 'Video uploaded and processed successfully', videoUrl: publicUrl });
        } catch (dbError) {
          res.status(500).json({ error: 'Database update failed: ' + dbError.message });
        }
      } else {
        res.status(500).json({ error: 'FFmpeg processing failed' });
      }
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(`FFmpeg: ${data}`);
    });
  });
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await User.aggregate([
      { $project: { orderCount: { $size: "$orderHistory" } } },
      { $group: { _id: null, total: { $sum: "$orderCount" } } }
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders: totalOrders.length > 0 ? totalOrders[0].total : 0,
    });
  } catch (error) {
    console.error('Admin summary error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSalesOverTime = async (req, res) => {
  try {
    const sales = await User.aggregate([
      { $unwind: "$orderHistory" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderHistory.date" } },
          totalSales: { $sum: "$orderHistory.finalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(sales);
  } catch (error) {
    console.error('Sales over time error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const users = await User.find({ 'orderHistory.0': { $exists: true } });
    
    let allOrders = [];
    users.forEach(user => {
      user.orderHistory.forEach(order => {
        allOrders.push({
          orderId: order._id || Math.random().toString(36).substr(2, 9),
          username: user.username,
          email: user.email,
          productName: order.productName,
          finalPrice: order.finalPrice,
          date: order.date,
          status: 'Paid'
        });
      });
    });

    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allOrders);
  } catch (error) {
    console.error("Admin Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.updateStock = async (req, res) => {
  try {
    console.log("Update Stock Request Body:", req.body);
    const { productId, size, quantity, price } = req.body;
    
    let product;
    
    // 1. Try finding by custom numeric ID
    if (productId && !isNaN(productId)) {
      product = await Product.findOne({ id: productId });
    }

    // 2. If not found, try finding by MongoDB _id
    if (!product && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }

    if (!product) {
      console.log("Product not found for ID:", productId);
      return res.status(404).json({ error: "Product not found" });
    }

    if (size) {
      // Update size-specific stock or add new size
      const sizeIndex = product.sizes.findIndex(s => s.size === size);
      if (sizeIndex === -1) {
        // Add new size variant if it doesn't exist
        product.sizes.push({ 
          size, 
          stockQuantity: quantity, 
          price: price ? parseFloat(price) : product.price // Use provided price or default
        });
      } else {
        product.sizes[sizeIndex].stockQuantity = quantity;
        if (price) {
          product.sizes[sizeIndex].price = parseFloat(price);
        }
      }
    } else {
      // Update main stock
      product.stockQuantity = quantity;
    }

    // Update availability
    const hasStock = product.sizes.some(s => s.stockQuantity > 0) || product.stockQuantity > 0;
    product.isAvailable = hasStock;

    await product.save();

    res.json({
      message: "Stock updated successfully",
      product: {
        id: product.id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        sizes: product.sizes,
        isAvailable: product.isAvailable
      }
    });
  } catch (error) {
    console.error("Stock Update Error:", error);
    res.status(500).json({ error: "Failed to update stock" });
  }
};

// Toggle user roles (Admin, Tester, Verified, Suspended)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body; // Expects { isAdmin, isTester, isVerified, isSuspended, isSuperAdmin }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const requester = req.user;

    // Only Super Admin can modify another Super Admin
    if (user.isSuperAdmin && (!requester || !requester.isSuperAdmin)) {
        return res.status(403).json({ error: 'Only Super Admins can modify other Super Admins' });
    }

    // Only Super Admin can promote someone to Super Admin
    if (updates.hasOwnProperty('isSuperAdmin')) {
        if (!requester || !requester.isSuperAdmin) {
            return res.status(403).json({ error: 'Only Super Admins can promote users to Super Admin' });
        }
        user.isSuperAdmin = updates.isSuperAdmin;
        if (user.isSuperAdmin) {
            user.isAdmin = true; // Implicitly admin
        }
    }

    if (updates.hasOwnProperty('isAdmin')) user.isAdmin = updates.isAdmin;
    if (updates.hasOwnProperty('isTester')) user.isTester = updates.isTester;
    if (updates.hasOwnProperty('isVerified')) user.isVerified = updates.isVerified;
    if (updates.hasOwnProperty('isSuspended')) user.isSuspended = updates.isSuspended;

    await user.save();

    res.json({ 
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isTester: user.isTester,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
        isSuperAdmin: user.isSuperAdmin
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.isSuperAdmin) {
            return res.status(403).json({ error: 'Cannot delete Super Admin' });
        }

        await User.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create User (Admin Action)
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, isAdmin, isTester, isSuperAdmin } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const argon2 = require('argon2');
        const hashedPassword = await argon2.hash(password);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            isAdmin: isAdmin || false,
            isTester: isTester || false,
            isVerified: true // Admin created users are verified
        });

        if (isSuperAdmin) {
            if (!req.user || !req.user.isSuperAdmin) {
                return res.status(403).json({ error: 'Only Super Admins can create Super Admins' });
            }
            user.isSuperAdmin = true;
            user.isAdmin = true;
        }

        await user.save();

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all testers
exports.getAllTesters = async (req, res) => {
  try {
    const testers = await User.find({ isTester: true }).select('-password');
    res.json(testers);
  } catch (error) {
    console.error('Get testers error:', error);
    res.status(500).json({ error: error.message });
  }
};
