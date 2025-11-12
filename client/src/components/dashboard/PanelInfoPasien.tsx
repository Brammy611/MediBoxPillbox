import React, { useState } from "react";
import axios from "axios";

interface InfoPasienData {
  nama: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamatLansia: string;
  riwayatAlergi: string;
  riwayatPenyakit: string;
}

interface InfoPasienProps {
  informasiPasien: InfoPasienData;
  patientId?: string;
  onUpdate?: (updatedData: InfoPasienData) => void;
}

export default function PanelInfoPasien({ 
  informasiPasien, 
  patientId,
  onUpdate 
}: InfoPasienProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<InfoPasienData>(informasiPasien);
  const [isSaving, setIsSaving] = useState(false);

  // Fungsi untuk menghitung umur dari tanggal lahir
  const hitungUmur = (tanggalLahir: string): number => {
    const today = new Date();
    const birthDate = new Date(tanggalLahir);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Fungsi untuk memformat tanggal lahir
  const formatTanggal = (tanggal: string): string => {
    const date = new Date(tanggal);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const handleEdit = () => {
    setEditData(informasiPasien);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(informasiPasien);
    setIsEditing(false);
  };

  const handleChange = (field: keyof InfoPasienData, value: string) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleSave = async () => {
    if (!patientId) {
      alert('Patient ID tidak tersedia');
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.put(
        `http://localhost:5000/api/dashboard/patient/${patientId}/info`,
        {
          infoType: 'pasien',
          infoData: editData
        }
      );

      if (response.data.success) {
        alert('Informasi pasien berhasil disimpan!');
        if (onUpdate && response.data.data) {
          onUpdate(response.data.data);
        }
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Error saving pasien info:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan informasi pasien';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const displayData = isEditing ? editData : informasiPasien;
  const umur = hitungUmur(displayData.tanggalLahir);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-soft p-6 border border-orange-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-orange-900">
          Informasi Lansia
        </h2>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Nama:</p>
          {isEditing ? (
            <input
              type="text"
              value={displayData.nama}
              onChange={(e) => handleChange('nama', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          ) : (
            <p className="text-sm text-orange-900">{displayData.nama}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Tanggal Lahir:</p>
          {isEditing ? (
            <input
              type="date"
              value={displayData.tanggalLahir}
              onChange={(e) => handleChange('tanggalLahir', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          ) : (
            <p className="text-sm text-orange-900">{formatTanggal(displayData.tanggalLahir)}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Umur:</p>
          <p className="text-sm text-orange-900">{umur} Tahun</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Jenis Kelamin:</p>
          {isEditing ? (
            <select
              value={displayData.jenisKelamin}
              onChange={(e) => handleChange('jenisKelamin', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="-">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          ) : (
            <p className="text-sm text-orange-900">{displayData.jenisKelamin}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Alamat Lansia:</p>
          {isEditing ? (
            <input
              type="text"
              value={displayData.alamatLansia}
              onChange={(e) => handleChange('alamatLansia', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          ) : (
            <p className="text-sm text-orange-900">{displayData.alamatLansia}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Riwayat Alergi:</p>
          {isEditing ? (
            <input
              type="text"
              value={displayData.riwayatAlergi}
              onChange={(e) => handleChange('riwayatAlergi', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Pisahkan dengan koma"
            />
          ) : (
            <p className="text-sm text-orange-900">{displayData.riwayatAlergi}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Riwayat Penyakit:</p>
          {isEditing ? (
            <input
              type="text"
              value={displayData.riwayatPenyakit}
              onChange={(e) => handleChange('riwayatPenyakit', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Pisahkan dengan koma"
            />
          ) : (
            <p className="text-sm text-orange-900">{displayData.riwayatPenyakit}</p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${
              isSaving
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 text-sm py-2 border-2 border-orange-500 text-orange-500 rounded-md font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
