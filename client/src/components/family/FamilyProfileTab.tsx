import React, { useState } from 'react';
import axios from 'axios';

interface LansiaProfile {
  nama: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  phone: string;
  age: number | null; // read-only, dihitung dari tanggalLahir
  riwayatAlergi: string;
  riwayatPenyakit: string;
}

interface CaregiverProfile {
  nama: string;
  email: string;
  jenisKelamin: string;
  alamat: string;
  hubungan: string;
  noHP: string;
}

interface FamilyProfileTabProps {
  profiles: {
    lansiaProfile: LansiaProfile;
    caregiverProfile: CaregiverProfile;
  };
  patientId: string;
}

const FamilyProfileTab: React.FC<FamilyProfileTabProps> = ({ profiles, patientId }) => {
  // State untuk Lansia Profile
  const [lansiaData, setLansiaData] = useState<LansiaProfile>(profiles.lansiaProfile);
  const [lansiaEdited, setLansiaEdited] = useState(false);

  // State untuk Caregiver Profile
  const [caregiverData, setCaregiverData] = useState<CaregiverProfile>(profiles.caregiverProfile);
  const [caregiverEdited, setCaregiverEdited] = useState(false);

  // Handler untuk Lansia Profile
  const handleLansiaChange = (field: keyof LansiaProfile, value: string) => {
    if (field === 'age') return; // age tidak bisa diedit manual
    setLansiaData(prev => ({ ...prev, [field]: value }));
    setLansiaEdited(true);
  };

  const handleLansiaSimpan = async () => {
    try {
      // Jangan kirim field age, karena dihitung dari tanggalLahir di server
      const { age, ...payload } = lansiaData;
      const response = await axios.put(
        `http://localhost:5000/api/family-dashboard/${patientId}/profiles`,
        {
          profileType: 'lansia',
          profileData: payload
        }
      );
      
      if (response.data.success) {
        alert('Profil Lansia berhasil disimpan!');
        setLansiaEdited(false);
      }
    } catch (error: any) {
      console.error('Error saving lansia profile:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan profil lansia';
      alert(errorMessage);
    }
  };

  const handleLansiaBatal = () => {
    setLansiaData(profiles.lansiaProfile);
    setLansiaEdited(false);
  };

  // Handler untuk Caregiver Profile
  const handleCaregiverChange = (field: keyof CaregiverProfile, value: string) => {
    setCaregiverData(prev => ({ ...prev, [field]: value }));
    setCaregiverEdited(true);
  };

  const handleCaregiverSimpan = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/family-dashboard/${patientId}/profiles`,
        {
          profileType: 'caregiver',
          profileData: caregiverData
        }
      );
      
      if (response.data.success) {
        alert('Profil Caregiver berhasil disimpan!');
        // Update state dengan data terbaru dari server
        if (response.data.data) {
          setCaregiverData(response.data.data);
        }
        setCaregiverEdited(false);
      }
    } catch (error: any) {
      console.error('Error saving caregiver profile:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan profil caregiver';
      alert(errorMessage);
    }
  };

  const handleCaregiverBatal = () => {
    setCaregiverData(profiles.caregiverProfile);
    setCaregiverEdited(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      {/* Lansia Profile */}
      <div className="bg-[#FFF8F0] rounded-xl p-5 sm:p-6 border border-black/10 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-ink mb-5 sm:mb-6 pb-3 border-b-2 border-brand-500">
          👤 Lansia Profile
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Nama:</label>
            <input
              type="text"
              value={lansiaData.nama}
              onChange={(e) => handleLansiaChange('nama', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Tanggal Lahir:</label>
            <input
              type="date"
              value={lansiaData.tanggalLahir}
              onChange={(e) => handleLansiaChange('tanggalLahir', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Jenis Kelamin:</label>
            <select
              value={lansiaData.jenisKelamin}
              onChange={(e) => handleLansiaChange('jenisKelamin', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="Tidak Diketahui">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Alamat:</label>
            <input
              type="text"
              value={lansiaData.alamat}
              onChange={(e) => handleLansiaChange('alamat', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-ink mb-2">No HP:</label>
              <input
                type="text"
                value={lansiaData.phone}
                onChange={(e) => handleLansiaChange('phone', e.target.value)}
                className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Usia:</label>
              <input
                type="text"
                value={lansiaData.age ?? ''}
                readOnly
                className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg bg-gray-100 text-black/60"
                title="Usia dihitung otomatis dari tanggal lahir"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Riwayat Alergi:</label>
            <input
              type="text"
              value={lansiaData.riwayatAlergi}
              onChange={(e) => handleLansiaChange('riwayatAlergi', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Riwayat Penyakit:</label>
            <input
              type="text"
              value={lansiaData.riwayatPenyakit}
              onChange={(e) => handleLansiaChange('riwayatPenyakit', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              onClick={handleLansiaSimpan}
              disabled={!lansiaEdited}
              className={`flex-1 py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
                lansiaEdited
                  ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              💾 Simpan
            </button>
            <button
              onClick={handleLansiaBatal}
              disabled={!lansiaEdited}
              className={`flex-1 py-3 text-sm sm:text-base border-2 rounded-lg font-semibold transition-all ${
                lansiaEdited
                  ? 'border-brand-500 text-brand-500 hover:bg-brand-50'
                  : 'border-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ❌ Batal
            </button>
          </div>
        </div>
      </div>

      {/* Caregiver Profile */}
      <div className="bg-[#FFF8F0] rounded-xl p-5 sm:p-6 border border-black/10 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-ink mb-5 sm:mb-6 pb-3 border-b-2 border-brand-500">
          👨‍⚕️ Caregiver Profile
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Nama:</label>
            <input
              type="text"
              value={caregiverData.nama}
              onChange={(e) => handleCaregiverChange('nama', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Email:</label>
            <input
              type="email"
              value={caregiverData.email}
              onChange={(e) => handleCaregiverChange('email', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg bg-gray-100 text-black/60 cursor-not-allowed"
              disabled
              title="Email tidak dapat diubah karena digunakan untuk login"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Jenis Kelamin:</label>
            <select
              value={caregiverData.jenisKelamin}
              onChange={(e) => handleCaregiverChange('jenisKelamin', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="-">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Alamat:</label>
            <input
              type="text"
              value={caregiverData.alamat}
              onChange={(e) => handleCaregiverChange('alamat', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">Hubungan dengan Lansia:</label>
            <input
              type="text"
              value={caregiverData.hubungan}
              onChange={(e) => handleCaregiverChange('hubungan', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-ink mb-2">No HP:</label>
            <input
              type="text"
              value={caregiverData.noHP}
              onChange={(e) => handleCaregiverChange('noHP', e.target.value)}
              className="w-full px-4 py-2.5 text-sm sm:text-base border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              onClick={handleCaregiverSimpan}
              disabled={!caregiverEdited}
              className={`flex-1 py-3 text-sm sm:text-base rounded-lg font-semibold transition-all ${
                caregiverEdited
                  ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              💾 Simpan
            </button>
            <button
              onClick={handleCaregiverBatal}
              disabled={!caregiverEdited}
              className={`flex-1 py-3 text-sm sm:text-base border-2 rounded-lg font-semibold transition-all ${
                caregiverEdited
                  ? 'border-brand-500 text-brand-500 hover:bg-brand-50'
                  : 'border-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ❌ Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyProfileTab;
