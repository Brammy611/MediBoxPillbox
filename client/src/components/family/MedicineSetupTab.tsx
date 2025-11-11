import React from 'react';

interface Medicine {
  noSekat: number;
  namaObat: string;
  aturanMinum: string;
  deskripsi: string;
  statusObat?: string;
}

interface MedicineSetupTabProps {
  medicines: Medicine[];
}

const MedicineSetupTab: React.FC<MedicineSetupTabProps> = ({ medicines }) => {
  const handleTambahObat = () => {
    // TODO: Implementasi logic untuk menambah obat (bisa modal atau navigasi ke form)
    console.log("Tombol Tambah Obat diklik!");
    alert("Fitur tambah obat akan segera hadir!");
  };

  return (
    <div className="bg-white rounded-lg border border-black/10 overflow-hidden">
      {/* Table Header & Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FFF8F0] border-b-2 border-brand-500">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                No.Sekat
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                Nama Obat
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                Aturan Minum
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                Deskripsi Obat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {medicines && medicines.length > 0 ? (
              medicines.map((obat) => (
                <tr 
                  key={obat.noSekat} 
                  className="hover:bg-brand-50/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-black/70">
                    {obat.noSekat}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-ink">
                    {obat.namaObat}
                  </td>
                  <td className="px-6 py-4 text-sm text-black/70">
                    {obat.aturanMinum}
                  </td>
                  <td className="px-6 py-4 text-sm text-black/70">
                    {obat.deskripsi}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={4} 
                  className="px-6 py-12 text-center text-black/50"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl">💊</div>
                    <p>Belum ada data obat yang di-setup.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Button */}
      <div className="px-6 py-5 bg-[#FFF8F0] border-t border-black/10">
        <button
          onClick={handleTambahObat}
          className="w-full sm:w-auto px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>Tambah Informasi Obat</span>
        </button>
      </div>
    </div>
  );
};

export default MedicineSetupTab;
