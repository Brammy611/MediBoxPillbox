const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Patient = require('../models/patient');
const Device = require('../models/device');

// JWT Secret (simpan di .env di production)
const JWT_SECRET = process.env.JWT_SECRET || 'medibox_secret_key_2025';

// @route   POST /api/auth/register
// @desc    Register user baru dengan serial number
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, serialNumber, password } = req.body;

    // Validasi input
    if (!name || !email || !phone || !serialNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Cek apakah serial number valid dan belum terdaftar
    const existingDevice = await Device.findOne({ serial_number: serialNumber });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru (caregiver)
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'caregiver'
    });

    await newUser.save();

    // Jika serial number belum terdaftar, buat device dan patient baru
    if (!existingDevice) {
      // Buat patient baru
      const newPatient = new Patient({
        name: name, // Nama sementara sama dengan caregiver
        username: name.replace(/\s+/g, ''),
        email: email,
        phone: phone,
        caregiver: newUser._id
      });

      await newPatient.save();

      // Buat device baru
      const newDevice = new Device({
        patient_id: newPatient._id,
        esp32_id: `ESP32-${serialNumber}`,
        serial_number: serialNumber,
        location: '',
        current_temp: 0,
        current_humidity: 0,
        fan_status: false,
        buzzer_status: false,
        firmware_version: 'v1.0.0'
      });

      await newDevice.save();

      // Update user dengan linked patient
      newUser.linked_patients.push(newPatient._id);
      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser._id, 
          email: newUser.email,
          role: newUser.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil! Device dan pasien baru telah dibuat.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          linked_patients: [newPatient._id]
        }
      });
    } else {
      // Serial number sudah terdaftar, hubungkan dengan patient yang ada
      const existingPatient = await Patient.findById(existingDevice.patient_id);
      
      if (!existingPatient) {
        return res.status(400).json({
          success: false,
          message: 'Data pasien tidak ditemukan untuk device ini'
        });
      }

      // Update caregiver di patient yang sudah ada
      existingPatient.caregiver = newUser._id;
      await existingPatient.save();

      // Update user dengan linked patient
      newUser.linked_patients.push(existingPatient._id);
      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser._id, 
          email: newUser.email,
          role: newUser.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil! Anda telah terhubung dengan device yang sudah ada.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          linked_patients: [existingPatient._id]
        }
      });
    }

  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user dengan email dan password
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }

    // Cek apakah user ada
    const user = await User.findOne({ email }).populate('linked_patients');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        linked_patients: user.linked_patients
      }
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user data
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('linked_patients');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};
