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

    // Cek apakah serial number valid
    const existingDevice = await Device.findOne({ serial_number: serialNumber });
    
    if (existingDevice && existingDevice.patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Serial number ini sudah terdaftar untuk pasien lain'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru (caregiver)
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'caregiver',
      has_setup_patient: false
    });

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
      message: 'Registrasi berhasil! Silakan setup data pasien Anda.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        has_setup_patient: false,
        patient_id: null
      },
      requiresPatientSetup: true,
      serialNumber: serialNumber // Kirim kembali untuk digunakan saat setup patient
    });

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
    const user = await User.findOne({ email }).populate('patient_id');
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
        patient_id: user.patient_id,
        has_setup_patient: user.has_setup_patient
      },
      requiresPatientSetup: !user.has_setup_patient
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
      .populate('patient_id');
    
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

// @route   POST /api/auth/setup-patient
// @desc    Setup data pasien untuk user yang baru daftar
// @access  Private
exports.setupPatient = async (req, res) => {
  try {
    const { 
      patientName, 
      patientPhone, 
      patientGender, 
      patientBirthDate, 
      patientAddress,
      allergies,
      conditions,
      serialNumber 
    } = req.body;

    // Validasi input
    if (!patientName || !serialNumber) {
      return res.status(400).json({
        success: false,
        message: 'Nama pasien dan serial number harus diisi'
      });
    }

    // Cek user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Cek apakah user sudah setup patient
    if (user.has_setup_patient && user.patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah memiliki data pasien'
      });
    }

    // Cek serial number
    let device = await Device.findOne({ serial_number: serialNumber });
    
    // Jika device belum ada, buat device baru
    if (!device) {
      device = new Device({
        serial_number: serialNumber,
        esp32_id: `ESP32-${serialNumber}`,
        patient_id: null,
        location: patientAddress || '',
        current_temp: 0,
        current_humidity: 0,
        fan_status: false,
        buzzer_status: false,
        firmware_version: 'v1.0.0'
      });
    } else if (device.patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Serial number ini sudah terdaftar untuk pasien lain'
      });
    }

    // Hitung umur dari birthDate
    let age = null;
    if (patientBirthDate) {
      const birthDate = new Date(patientBirthDate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Buat patient baru
    const newPatient = new Patient({
      name: patientName,
      username: patientName.replace(/\s+/g, ''),
      phone: patientPhone,
      gender: patientGender,
      birthDate: patientBirthDate,
      age: age,
      address: patientAddress,
      medicalHistory: {
        allergies: allergies || [],
        conditions: conditions || []
      },
      caregiver_id: user._id
    });

    await newPatient.save();

    // Update device dengan patient_id
    device.patient_id = newPatient._id;
    await device.save();

    // Update patient dengan device_id
    newPatient.device_id = device._id;
    await newPatient.save();

    // Update user
    user.patient_id = newPatient._id;
    user.has_setup_patient = true;
    await user.save();

    res.json({
      success: true,
      message: 'Data pasien berhasil disimpan',
      patient: newPatient,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patient_id: user.patient_id,
        has_setup_patient: user.has_setup_patient
      }
    });

  } catch (error) {
    console.error('Error in setupPatient:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};
