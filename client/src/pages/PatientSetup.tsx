import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import medibox from '../assets/medibox.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function PatientSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get serialNumber from location state (passed from Register)
  const serialNumber = location.state?.serialNumber || '';

  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientGender: '',
    patientBirthDate: '',
    patientAddress: '',
    allergies: '',
    conditions: '',
    serialNumber: serialNumber
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/auth/setup-patient`,
        {
          ...formData,
          allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
          conditions: formData.conditions ? formData.conditions.split(',').map(s => s.trim()) : []
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Refresh user data
        window.location.href = '/dashboard-utama';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Setup pasien gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src={medibox} alt="MediBox" className="w-24 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Setup Data Pasien</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Lengkapi data pasien yang akan Anda rawat
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nama Pasien */}
            <div className="col-span-2">
              <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap Pasien <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                placeholder="Contoh: Slamet Widodo"
              />
            </div>

            {/* Nomor Telepon */}
            <div>
              <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                id="patientPhone"
                name="patientPhone"
                value={formData.patientPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                placeholder="+628123456789"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                id="patientGender"
                name="patientGender"
                value={formData.patientGender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
              >
                <option value="">Pilih</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label htmlFor="patientBirthDate" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                id="patientBirthDate"
                name="patientBirthDate"
                value={formData.patientBirthDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Serial Number (readonly) */}
            <div>
              <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number MediBox
              </label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 outline-none"
                placeholder="MBX-123456"
              />
            </div>

            {/* Alamat */}
            <div className="col-span-2">
              <label htmlFor="patientAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                id="patientAddress"
                name="patientAddress"
                value={formData.patientAddress}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Alamat lengkap pasien"
              />
            </div>

            {/* Riwayat Alergi */}
            <div className="col-span-2">
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                Riwayat Alergi
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                placeholder="Pisahkan dengan koma. Contoh: Seafood, Peanut"
              />
            </div>

            {/* Riwayat Penyakit */}
            <div className="col-span-2">
              <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-1">
                Riwayat Penyakit
              </label>
              <input
                type="text"
                id="conditions"
                name="conditions"
                value={formData.conditions}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                placeholder="Pisahkan dengan koma. Contoh: Diabetes, Hipertensi"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Menyimpan...' : 'Simpan Data Pasien'}
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Catatan:</strong> Data pasien ini akan terhubung dengan MediBox Anda dan dapat diubah kapan saja di Family Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
