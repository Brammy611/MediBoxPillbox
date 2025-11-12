import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface TambahObatModalProps {
  onClose: () => void;
  onObatAdded: () => void;
  patientId?: string | null;
}

const TambahObatModal: React.FC<TambahObatModalProps> = ({ onClose, onObatAdded, patientId }) => {
  const [formData, setFormData] = useState({
    namaObat: '',
    aturanMinum: '',
    deskripsi: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.namaObat.trim()) {
      setError('Nama obat wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Kirim data ke API backend
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const payload = {
        ...formData,
        patientId: patientId || undefined
      };
      await axios.post(`${API_BASE}/api/obat/tambah`, payload);
      
      // Panggil callback untuk refresh dan tutup modal
      onObatAdded();
      
    } catch (err: any) {
      console.error("Error submit:", err);
      setError(err.response?.data?.message || 'Gagal terhubung ke server');
      setIsSubmitting(false);
    }
  };

  // Close modal when clicking outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-ink">Tambah Informasi Obat Baru</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Nama Obat */}
          <div className="mb-4">
            <label htmlFor="namaObat" className="block text-sm font-medium text-ink mb-2">
              Nama Obat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="namaObat"
              name="namaObat"
              value={formData.namaObat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Contoh: Paracetamol"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Aturan Minum */}
          <div className="mb-4">
            <label htmlFor="aturanMinum" className="block text-sm font-medium text-ink mb-2">
              Aturan Minum
            </label>
            <input
              type="text"
              id="aturanMinum"
              name="aturanMinum"
              value={formData.aturanMinum}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Contoh: 3 kali sehari"
              disabled={isSubmitting}
            />
          </div>

          {/* Deskripsi Obat */}
          <div className="mb-4">
            <label htmlFor="deskripsi" className="block text-sm font-medium text-ink mb-2">
              Deskripsi Obat
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              placeholder="Contoh: Setelah makan, diminum dengan air putih"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahObatModal;
