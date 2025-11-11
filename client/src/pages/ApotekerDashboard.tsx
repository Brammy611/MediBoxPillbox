import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface HistoryObat {
  id: string;
  noSekat: number;
  namaObat: string;
  aturanMinum: string;
  deskripsi: string;
  statusObat: string;
}

interface CurrentObat {
  id: string;
  noSekat: number;
  namaObat: string;
  aturanMinum: string;
  deskripsi: string;
}

interface ApotekerData {
  historyObat: HistoryObat[];
  currentObat: CurrentObat[];
}

const ApotekerDashboard: React.FC = () => {
  const [data, setData] = useState<ApotekerData>({
    historyObat: [],
    currentObat: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mock data
  const mockData: ApotekerData = {
    historyObat: [
      {
        id: 'h1',
        noSekat: 1,
        namaObat: 'Prostat',
        aturanMinum: '2 kali Sehari',
        deskripsi: 'Setelah Makan',
        statusObat: 'Kosong'
      },
      {
        id: 'h2',
        noSekat: 2,
        namaObat: 'Paracetamol',
        aturanMinum: '3 kali Sehari',
        deskripsi: 'Jika perlu',
        statusObat: 'Selesai'
      }
    ],
    currentObat: [
      {
        id: 'c1',
        noSekat: 1,
        namaObat: 'Amoxcillin',
        aturanMinum: '2 kali Sehari',
        deskripsi: 'Setelah Makan'
      }
    ]
  };

  // Simulate API call
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        // Dalam implementasi real, ganti dengan:
        // const response = await axios.get(`/api/apoteker-dashboard/${patientId}`);
        // setData(response.data);
        
        setData(mockData);
        setIsLoading(false);
      }, 800);
    };

    fetchData();
  }, []);

  const handleTambahObat = () => {
    // TODO: Implementasi logic untuk menambah obat baru
    console.log('Tambah Informasi Obat clicked');
    // Bisa membuka modal atau navigate ke form
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-lg text-black/60">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">Apoteker Dashboard</h1>
        <p className="text-sm text-black/60 mt-2">Kelola informasi obat pasien</p>
      </div>

      {/* Bagian 1: History Informasi Obat */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-brand-500 mb-4">
          History Informasi Obat
        </h2>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5E6D3]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink">
                    No.Sekat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink">
                    Nama Obat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink">
                    Aturan Minum
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink">
                    Deskripsi Obat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink">
                    Status Obat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.historyObat.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-black/60">
                      Tidak ada data history obat
                    </td>
                  </tr>
                ) : (
                  data.historyObat.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-ink">{item.noSekat}</td>
                      <td className="px-6 py-4 text-sm text-ink">{item.namaObat}</td>
                      <td className="px-6 py-4 text-sm text-ink">{item.aturanMinum}</td>
                      <td className="px-6 py-4 text-sm text-ink">{item.deskripsi}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`font-semibold ${
                            item.statusObat === 'Kosong'
                              ? 'text-orange-600'
                              : item.statusObat === 'Selesai'
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {item.statusObat}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bagian 2: Update Obat */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-brand-500 mb-4">
          Update Obat
        </h2>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5E6D3]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink">
                    No.Sekat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink">
                    Nama Obat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink">
                    Aturan Minum
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink">
                    Deskripsi Obat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.currentObat.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-black/60">
                      Tidak ada obat aktif saat ini
                    </td>
                  </tr>
                ) : (
                  data.currentObat.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-ink">{item.noSekat}</td>
                      <td className="px-6 py-4 text-sm text-ink">{item.namaObat}</td>
                      <td className="px-6 py-4 text-sm text-ink">{item.aturanMinum}</td>
                      <td className="px-6 py-4 text-sm text-ink">{item.deskripsi}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tombol Tambah */}
        <div className="mt-4">
          <button
            onClick={handleTambahObat}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-brand-500 text-brand-500 rounded-md hover:bg-brand-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Tambah Informasi Obat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApotekerDashboard;
