import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPrompt from '../components/family/LoginPrompt';
import PanelStatistikFamily from '../components/family/PanelStatistikFamily';
import NavigasiTab from '../components/family/NavigasiTab';
import FamilyProfileTab from '../components/family/FamilyProfileTab';
import PlaceholderTab from '../components/family/PlaceholderTab';

interface AuthState {
  isLoggedIn: boolean;
  user?: {
    role: string;
    patientId: string;
    email: string;
  };
}

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
}

const FamilyDashboard: React.FC = () => {
  // State untuk autentikasi (SIMULASI - ganti dengan real auth nanti)
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: true, // Set false untuk test kondisi belum login
    user: {
      role: 'family',
      patientId: '123',
      email: 'FamilyAkun@gmail.com'
    }
  });

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState<string>('Family Profile');

  // State untuk data dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data dari API jika sudah login
  useEffect(() => {
    if (auth.isLoggedIn && auth.user?.role === 'family') {
      fetchDashboardData();
    }
  }, [auth]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/family-dashboard/${auth.user?.patientId}`
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
    // Simulasi login berhasil
    setAuth({
      isLoggedIn: true,
      user: {
        role: 'family',
        patientId: '123',
        email: 'FamilyAkun@gmail.com'
      }
    });
  };

  const handleDaftar = () => {
    // TODO: Implementasi logic register
    console.log('Navigasi ke halaman registrasi');
  };

  // KONDISI 1: Belum Login
  if (!auth.isLoggedIn) {
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
  if (auth.user?.role !== 'family') {
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
            Halaman ini hanya untuk pengguna dengan role 'family'
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

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
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
            patientId={auth.user.patientId}
          />
        )}
        
        {activeTab === 'Medicine Setup' && (
          <PlaceholderTab tabName="Medicine Setup" />
        )}
        
        {activeTab === 'Saran Pola Makan' && (
          <PlaceholderTab tabName="Saran Pola Makan" />
        )}
        
        {activeTab === 'Cek Gejala Mandiri' && (
          <PlaceholderTab tabName="Cek Gejala Mandiri" />
        )}
        
        {activeTab === 'Notifikasi' && (
          <PlaceholderTab tabName="Notifikasi" />
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
