import React, { useState } from "react";
import axios from "axios";

interface InfoKeluargaData {
  nama: string;
  email: string;
  hubunganDenganLansia: string;
  alamat: string;
  noHp: string;
  jenisKelamin: string;
}

interface InfoKeluargaProps {
  informasiKeluarga: InfoKeluargaData | null;
  patientId?: string;
  onUpdate?: (updatedData: InfoKeluargaData) => void;
}

export default function PanelInfoKeluarga({ 
  informasiKeluarga, 
  patientId,
  onUpdate 
}: InfoKeluargaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<InfoKeluargaData | null>(informasiKeluarga);
  const [isSaving, setIsSaving] = useState(false);

  if (!informasiKeluarga) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-soft p-6 border border-orange-200">
        <h2 className="text-lg font-semibold mb-2 text-orange-900">Informasi Keluarga</h2>
        <p className="text-sm text-orange-700">Data keluarga belum tersedia.</p>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData(informasiKeluarga);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(informasiKeluarga);
    setIsEditing(false);
  };

  const handleChange = (field: keyof InfoKeluargaData, value: string) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!editData || !patientId) {
      alert('Data tidak lengkap');
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.put(
        `http://localhost:5000/api/dashboard/patient/${patientId}/info`,
        {
          infoType: 'keluarga',
          infoData: editData
        }
      );

      if (response.data.success) {
        alert('Informasi keluarga berhasil disimpan!');
        if (onUpdate && response.data.data) {
          onUpdate(response.data.data);
        }
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Error saving keluarga info:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan informasi keluarga';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const displayData = isEditing ? editData : informasiKeluarga;

  if (!displayData) return null;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-soft p-6 border border-orange-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-orange-900">
          Informasi Keluarga
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
          <p className="text-xs text-orange-700 font-medium mb-1">Email:</p>
          <p className="text-sm text-orange-900">{displayData.email}</p>
          {isEditing && (
            <p className="text-xs text-orange-600 italic mt-1">Email tidak dapat diubah</p>
          )}
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Hubungan dengan Lansia:</p>
          {isEditing ? (
            <input
              type="text"
              value={displayData.hubunganDenganLansia}
              onChange={(e) => handleChange('hubunganDenganLansia', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g., Anak, Cucu, Keponakan"
            />
          ) : (
            <p className="text-sm text-orange-900">{displayData.hubunganDenganLansia}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Alamat:</p>
          {isEditing ? (
            <input
              type="text"
              value={displayData.alamat}
              onChange={(e) => handleChange('alamat', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          ) : (
            <p className="text-sm text-orange-900">{displayData.alamat}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">No Hp:</p>
          {isEditing ? (
            <input
              type="text"
              value={displayData.noHp}
              onChange={(e) => handleChange('noHp', e.target.value)}
              className="w-full text-sm px-2 py-1 border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          ) : (
            <p className="text-sm text-orange-900">{displayData.noHp}</p>
          )}
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
