
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password, role, plate, address, adminKey } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!role || !['admin', 'driver'].includes(role)) {
      return res.status(400).json({ message: 'Role is required and must be admin or driver' });
    }

    if (role === 'admin') {
      if (!process.env.ADMIN_KEY) {
        return res.status(500).json({ message: 'ADMIN_KEY is not configured on server' });
      }
      if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ message: 'Invalid admin key' });
      }
    }

    if (role === 'driver') {
      if (!plate || !address) {
        return res.status(400).json({ message: 'Plate and address are required for drivers' });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,
      role,
      plate: role === 'driver' ? plate : undefined,
      address: role === 'driver' ? address : undefined
    });

    return res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plate: user.plate || null,
      address: user.address || null,
      token: generateToken(user._id),
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plate: user.plate || null,
        address: user.address || null,
        token: generateToken(user.id)
      });
    }
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plate: user.plate || null,
      address: user.address || null,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, address, plate, password, role } = req.body;


    if (role && role !== user.role) {
      return res.status(403).json({ message: 'Role change is not allowed' });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (user.role === 'driver') {
      user.address = address ?? user.address;
      user.plate = plate ?? user.plate;
    }

   
    if (password && password.trim().length >= 6) {
      
      user.password = password;
    }

    const updatedUser = await user.save();

    return res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      plate: updatedUser.plate || null,
      address: updatedUser.address || null,
      token: generateToken(updatedUser.id) 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
