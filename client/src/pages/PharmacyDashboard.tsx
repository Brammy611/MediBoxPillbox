import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';
import TambahObatModal from '../components/pharmacy/TambahObatModal';

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

interface PharmacyData {
  historyObat: HistoryObat[];
  currentObat: CurrentObat[];
}

const PharmacyDashboard: React.FC = () => {
  const [data, setData] = useState<PharmacyData>({
    historyObat: [],
    currentObat: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Mock data
  const mockData: PharmacyData = {
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

  // Fetch data from API berdasarkan patient_id
  const fetchData = async (selectedPatientId?: string) => {
    setIsLoading(true);
    try {
      const targetPatientId = selectedPatientId || patientId;
      
      if (!targetPatientId) {
        console.log('No patient ID available yet');
        setIsLoading(false);
        return;
      }

      // Ambil data medicines dari API berdasarkan patient_id
      const response = await axios.get(`${API_BASE}/api/medicines/patient/${targetPatientId}`);
      
      if (response.data.success && response.data.medicines) {
        const medicines = response.data.medicines;
        
        // Pisahkan berdasarkan status
        // History: Obat dengan status "Habis" atau stock <= 0
        const history = medicines
          .filter((med: any) => 
            med.status === 'Habis' || 
            (med.quantity_in_box !== undefined && med.quantity_in_box <= 0) ||
            (med.stock !== undefined && med.stock <= 0)
          )
          .map((med: any) => ({
            id: med._id,
            noSekat: med.compartmentNumber || med.section_number || 0,
            namaObat: med.name,
            aturanMinum: med.schedule && med.schedule.length > 0 
              ? `${med.schedule.length} kali sehari` 
              : med.dosage || '-',
            deskripsi: med.description || '-',
            statusObat: 'Kosong'
          }));
        
        // Current: Obat dengan status "Tersedia" atau "Hampir Habis"
        const current = medicines
          .filter((med: any) => 
            med.status === 'Tersedia' || 
            med.status === 'Hampir Habis' ||
            ((med.quantity_in_box === undefined || med.quantity_in_box > 0) &&
             (med.stock === undefined || med.stock > 0))
          )
          .map((med: any) => ({
            id: med._id,
            noSekat: med.compartmentNumber || med.section_number || 0,
            namaObat: med.name,
            aturanMinum: med.schedule && med.schedule.length > 0 
              ? `${med.schedule.length} kali sehari` 
              : med.dosage || '-',
            deskripsi: med.description || '-'
          }));
        
        setData({ historyObat: history, currentObat: current });
      } else {
        // Jika tidak ada data, set empty
        setData({ historyObat: [], currentObat: [] });
      }
    } catch (error) {
      console.error('Error fetching medicines data:', error);
      // Jika error, fallback ke mock data
      setData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // Load patients on mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/dashboard/patients`);
        if (response.data?.success && response.data.patients.length > 0) {
          setPatients(response.data.patients);
          const firstPatientId = response.data.patients[0]._id;
          setPatientId(firstPatientId);
          // Fetch data untuk patient pertama
          fetchData(firstPatientId);
        } else {
          console.log('No patients found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading patients:', error);
        setIsLoading(false);
      }
    };
    
    loadPatients();
  }, []);

  const handleTambahObat = () => {
    setIsModalOpen(true);
  };

  const handleObatAdded = () => {
    setIsModalOpen(false);
    fetchData(patientId || undefined); // Refresh data setelah obat baru ditambahkan
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPatientId = e.target.value;
    setPatientId(newPatientId);
    fetchData(newPatientId);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink">Pharmacy Dashboard</h1>
            <p className="text-sm text-black/60 mt-2">Kelola informasi obat pasien</p>
          </div>
          
          {/* Patient Selector */}
          {patients.length > 1 && (
            <div className="flex items-center gap-3">
              <label htmlFor="patient-select" className="text-sm font-medium text-ink">
                Pilih Pasien:
              </label>
              <select
                id="patient-select"
                value={patientId || ''}
                onChange={handlePatientChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name || patient.username || patient._id}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
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

      {/* Modal Tambah Obat */}
      {isModalOpen && (
        <TambahObatModal 
          onClose={() => setIsModalOpen(false)}
          onObatAdded={handleObatAdded}
          patientId={patientId}
        />
      )}
    </div>
  );
};

export default PharmacyDashboard;
