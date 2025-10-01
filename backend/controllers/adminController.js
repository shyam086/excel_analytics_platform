const User = require('../models/User');
const File = require('../models/File');

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.promoteToAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: 'admin' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User promoted to admin', user: updatedUser });
  } catch (err) {
    console.error('Promote error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const files = await File.find().populate('user', 'name email');
    res.status(200).json(files);
  } catch (err) {
    console.error('Fetch files error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
