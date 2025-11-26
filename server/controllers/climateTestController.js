const ClimateTest = require('../models/ClimateTest');
const User = require('../models/User');

// Get all climate tests (admin sees all, tester sees only their own)
exports.getAllTests = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let tests;
    if (user.isAdmin) {
      // Admin sees all tests
      tests = await ClimateTest.find().sort({ createdAt: -1 });
    } else if (user.isTester) {
      // Tester sees only their assigned tests
      tests = await ClimateTest.find({ testerId: userId }).sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ error: 'Access denied. Not a tester or admin.' });
    }

    res.json(tests);
  } catch (error) {
    console.error('Get climate tests error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new climate test (admin only)
exports.createTest = async (req, res) => {
  try {
    const { perfumeName, perfumeImage, testerId, climate, endDate } = req.body;

    // Verify admin
    const adminUser = await User.findById(req.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get tester info
    const tester = await User.findById(testerId);
    if (!tester) {
      return res.status(404).json({ error: 'Tester not found' });
    }

    if (!tester.isTester) {
      return res.status(400).json({ error: 'Selected user is not a tester' });
    }

    const newTest = new ClimateTest({
      perfumeName,
      perfumeImage: perfumeImage || '',
      testerId,
      testerName: tester.username,
      climate: climate || 'Room Temperature',
      endDate: endDate ? new Date(endDate) : null
    });

    await newTest.save();
    res.status(201).json({ message: 'Climate test created successfully', test: newTest });
  } catch (error) {
    console.error('Create climate test error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update climate test (admin or assigned tester)
exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    const test = await ClimateTest.findById(id);
    if (!test) {
      return res.status(404).json({ error: 'Climate test not found' });
    }

    const user = await User.findById(userId);
    
    // Check permissions: admin can update anything, tester can only update their own
    if (!user.isAdmin && test.testerId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Testers can only update status and finalRating, not core test details
    if (!user.isAdmin) {
      const allowedUpdates = ['status', 'finalRating'];
      Object.keys(updates).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete updates[key];
        }
      });
    }

    Object.assign(test, updates);
    await test.save();

    res.json({ message: 'Climate test updated successfully', test });
  } catch (error) {
    console.error('Update climate test error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete climate test (admin only)
exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const test = await ClimateTest.findByIdAndDelete(id);
    if (!test) {
      return res.status(404).json({ error: 'Climate test not found' });
    }

    res.json({ message: 'Climate test deleted successfully' });
  } catch (error) {
    console.error('Delete climate test error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add remark/feedback to climate test (assigned tester or admin)
exports.addRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Remark text is required' });
    }

    const test = await ClimateTest.findById(id);
    if (!test) {
      return res.status(404).json({ error: 'Climate test not found' });
    }

    const user = await User.findById(userId);
    
    // Check permissions
    if (!user.isAdmin && test.testerId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    test.remarks.push({
      text: text.trim(),
      timestamp: new Date(),
      author: user.username
    });

    await test.save();

    res.json({ message: 'Remark added successfully', test });
  } catch (error) {
    console.error('Add remark error:', error);
    res.status(500).json({ error: error.message });
  }
};
