import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoginPrompt from '../components/family/LoginPrompt';
import PanelStatistikFamily from '../components/family/PanelStatistikFamily';
import NavigasiTab from '../components/family/NavigasiTab';
import FamilyProfileTab from '../components/family/FamilyProfileTab';
import MedicineSetupTab from '../components/family/MedicineSetupTab';
import SaranPolaMakanTab from '../components/family/SaranPolaMakanTab';
import CekGejalaMandiriTab from '../components/family/CekGejalaMandiriTab';
import NotifikasiTab from '../components/family/NotifikasiTab';
import PlaceholderTab from '../components/family/PlaceholderTab';

interface DashboardData {
  stats: {
    waktuPengambilanObat: Array<{ hari: string; jumlah: number }>;
    analisisWaktuKritis: Array<{ waktu: string; persen: number; label: string }>;
    statusKepatuhan: string;
    kategoriKepatuhan?: string;
    peringatanStok: string;
  };
  profiles: {
    lansiaProfile: {
      nama: string;
      tanggalLahir: string;
      jenisKelamin: string;
      alamat: string;
      phone: string;
      age: number | null;
      riwayatAlergi: string;
      riwayatPenyakit: string;
    };
    caregiverProfile: {
      nama: string;
      email: string;
      jenisKelamin: string;
      alamat: string;
      hubungan: string;
      noHP: string;
    };
  };
  informasiObat: Array<{
    noSekat: number;
    namaObat: string;
    aturanMinum: string;
    deskripsi: string;
    statusObat?: string;
  }>;
  saranPolaMakan: {
    disclaimer: string;
    interaksiObat: Array<{
      obatTerdeteksi: string;
      peringatan: string;
      alasan: string;
    }>;
    tipsEfekSamping: {
      obatTerdeteksi: string;
      efekSampingUmum: string;
      tips: string;
    };
    rekomendasiMakanan: Array<{
      id: number;
      judul: string;
      makanan: string[];
      deskripsi: string;
      deskripsiLanjutan?: string;
    }>;
    daftarObatTerkait: string[];
  };
  cekGejala?: {
    initialMessage: string;
    quickReplies: string[];
  };
  notifikasi?: Array<{
    id: string;
    tipe: 'warning' | 'info';
    pesan: string;
  }>;
}

const FamilyDashboard: React.FC = () => {
  const { user, initialLoading } = useAuth();
  
  // State untuk tab aktif (Default: Family Profile)
  const [activeTab, setActiveTab] = useState<string>('Family Profile');

  // State untuk data dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data dashboard ketika user dan patient_id sudah tersedia
  useEffect(() => {
    // Tunggu initialLoading selesai dulu
    if (initialLoading) {
      return;
    }

    if (user?.patient_id) {
      fetchDashboardData(user.patient_id._id || user.patient_id);
    } else {
      setIsLoading(false);
    }
  }, [user, initialLoading]);

  const fetchDashboardData = async (pid: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/family-dashboard/${pid}`
      );

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError('Gagal memuat data dashboard');
      }
    } catch (err: any) {
      console.error('Error fetching family dashboard:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk tombol Masuk/Daftar
  const handleMasuk = () => {
    // TODO: Implementasi logic login
    console.log('Navigasi ke halaman login');
  };

  const handleDaftar = () => {
    // TODO: Implementasi logic register
    console.log('Navigasi ke halaman registrasi');
  };

  // Show loading during initial auth check
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-lg text-black/60">Memuat...</p>
        </div>
      </div>
    );
  }

  // KONDISI 1: Belum Login
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink">Family Dashboard</h1>
        </div>
        <LoginPrompt onMasuk={handleMasuk} onDaftar={handleDaftar} />
      </div>
    );
  }

  // KONDISI 2: Sudah Login tapi Role bukan Family
  if (user.role !== 'family' && user.role !== 'caregiver') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink">Family Dashboard</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">
            Anda tidak memiliki akses ke halaman ini
          </p>
          <p className="text-red-600 text-sm mt-2">
            Halaman ini hanya untuk pengguna dengan role 'family' atau 'caregiver'
          </p>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-lg text-black/60">Memuat data family dashboard...</p>
        </div>
      </div>
    );
  }

  // Jika belum setup pasien
  if (!user.patient_id) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink">Family Dashboard</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-semibold mb-2">
            Data Pasien Belum Dilengkapi
          </p>
          <p className="text-yellow-700 text-sm">
            Silakan lengkapi data pasien terlebih dahulu untuk mengakses Family Dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/setup-pasien'}
            className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
          >
            Setup Pasien
          </button>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => {
              const patientId = user.patient_id?._id || user.patient_id;
              if (patientId) fetchDashboardData(patientId);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-black/60">Data tidak tersedia</p>
      </div>
    );
  }

  const patientId = user.patient_id?._id || user.patient_id;

  // KONDISI 3: Sudah Login sebagai Family - Tampilkan Dashboard Lengkap
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">Family Dashboard</h1>
        <p className="text-sm text-black/60 mt-2">
          Selamat datang, {dashboardData.profiles.caregiverProfile.nama}
        </p>
      </div>

      {/* Banner Info (Jika belum lengkap profile) - Opsional */}
      {/* <div className="bg-white border-2 border-brand-500 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-ink">Anda Belum Login Sebagai Family</h3>
          <p className="text-sm text-black/60">Silakan masuk ke akun anda</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border-2 border-brand-500 text-brand-500 rounded-md hover:bg-brand-50">
            Masuk
          </button>
          <button className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600">
            Daftar
          </button>
        </div>
      </div> */}

      {/* Panel Statistik (Charts & Status) */}
      <PanelStatistikFamily stats={dashboardData.stats} />

      {/* Navigasi Tab */}
      <NavigasiTab activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Konten Tab */}
      <div className="mb-6">
        {activeTab === 'Family Profile' && (
          <FamilyProfileTab 
            profiles={dashboardData.profiles}
            patientId={patientId}
          />
        )}
        
        {activeTab === 'Medicine Setup' && (
          <MedicineSetupTab 
            medicines={dashboardData.informasiObat}
            patientId={patientId}
            onRefresh={() => patientId && fetchDashboardData(patientId)}
          />
        )}
        
        {activeTab === 'Saran Pola Makan' && (
          <SaranPolaMakanTab data={dashboardData.saranPolaMakan} />
        )}
        
        {activeTab === 'Cek Gejala Mandiri' && (
          <CekGejalaMandiriTab 
            initData={dashboardData.cekGejala}
            profiles={dashboardData.profiles}
            patientId={patientId}
          />
        )}
        
        {activeTab === 'Notifikasi' && (
          <NotifikasiTab />
        )}
      </div>

      {/* Banner Bawah (Jika belum login) - Sesuai gambar */}
      {/* <div className="bg-white border-2 border-brand-500 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-ink mb-2">Anda Belum Login</h3>
        <p className="text-black/60 mb-4">Silakan masuk ke akun anda</p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-2 border-2 border-brand-500 text-brand-500 rounded-md hover:bg-brand-50">
            Masuk
          </button>
          <button className="px-6 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600">
            Daftar
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default FamilyDashboard;
