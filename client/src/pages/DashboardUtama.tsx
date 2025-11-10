import React, { useState, useEffect } from "react";
import axios from "axios";
import PanelStatistik from "../components/dashboard/PanelStatistik";
import PanelAktivitas from "../components/dashboard/PanelAktivitas";
import PanelInfoPasien from "../components/dashboard/PanelInfoPasien";
import PanelInfoKeluarga from "../components/dashboard/PanelInfoKeluarga";
import TabelObat from "../components/dashboard/TabelObat";

interface DashboardData {
  informasiPasien: {
    nama: string;
    umur: number;
    jenisKelamin: string;
    alamatLansia: string;
    riwayatAlergi: string;
    riwayatPenyakit: string;
  };
  informasiKeluarga: {
    nama: string;
    email: string;
    hubunganDenganLansia: string;
    alamat: string;
    noHp: string;
    jenisKelamin: string;
  };
  statistik: {
    waktuPengambilanObat: Array<{ hari: string; jumlah: number }>;
    analisisWaktuKritis: Array<{ waktu: string; persen: number; label: string }>;
    keterangan: string;
    statusKepatuhan: {
      status: string;
      kategori: string;
    };
    peringatanStok: string;
  };
  aktivitas: {
    riwayatRealTime: Array<{
      waktu: string;
      namaObat: string;
      status: string;
      statusIcon: string;
      deskripsi: string;
    }>;
    totalMissedHariIni: number;
    deteksiAnomali: {
      pesan: string;
      waktu: string;
      tingkatKeparahan: string;
    };
  };
  informasiObat: Array<{
    noSekat: number;
    namaObat: string;
    aturanMinum: string;
    deskripsi: string;
    statusObat: string;
  }>;
}

export default function DashboardUtama() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Ganti '123' dengan patientId yang sebenarnya dari auth/context
      // Ganti 123 dengan Patient ID dari seeder
    const response = await axios.get(
    `http://localhost:5000/api/dashboard/patient/673a1b2c3d4e5f6789012345`
    );
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError("Gagal memuat data dashboard");
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-lg text-black/60">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

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

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-black/60">Data tidak tersedia</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Dashboard Utama</h1>
        <p className="text-sm text-black/60 mt-1">
          Selamat datang, {dashboardData.informasiKeluarga.nama}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Statistik - Span 2 kolom */}
        <div className="lg:col-span-2 space-y-6">
          <PanelStatistik statistik={dashboardData.statistik} />
          <PanelAktivitas aktivitas={dashboardData.aktivitas} />
        </div>

        {/* Panel Info - Sidebar kanan */}
        <div className="space-y-6">
          <PanelInfoPasien informasiPasien={dashboardData.informasiPasien} />
          <PanelInfoKeluarga informasiKeluarga={dashboardData.informasiKeluarga} />
        </div>
      </div>

      {/* Tabel Obat - Full width */}
      <div className="mt-6">
        <TabelObat informasiObat={dashboardData.informasiObat} />
      </div>
    </div>
  );
}
