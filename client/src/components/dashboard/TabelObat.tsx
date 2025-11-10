import React from "react";

interface TabelObatProps {
  informasiObat: Array<{
    noSekat: number;
    namaObat: string;
    aturanMinum: string;
    deskripsi: string;
    statusObat: string;
  }>;
}

export default function TabelObat({ informasiObat }: TabelObatProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "tersedia":
        return "text-green-600";
      case "hampir habis":
        return "text-orange-600";
      case "habis":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 border border-black/5">
      <h2 className="text-lg font-semibold mb-4">Informasi Obat</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black/10">
              <th className="text-left py-3 px-4 font-semibold">No.Sekat</th>
              <th className="text-left py-3 px-4 font-semibold">Nama Obat</th>
              <th className="text-left py-3 px-4 font-semibold">Aturan Minum</th>
              <th className="text-left py-3 px-4 font-semibold">Deskripsi Obat</th>
              <th className="text-left py-3 px-4 font-semibold">Status Obat</th>
            </tr>
          </thead>
          <tbody>
            {informasiObat.map((obat, index) => (
              <tr key={index} className="border-b border-black/5 hover:bg-brand-50/30">
                <td className="py-3 px-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-500 text-white font-medium">
                    {obat.noSekat}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">{obat.namaObat}</td>
                <td className="py-3 px-4 text-black/70">{obat.aturanMinum}</td>
                <td className="py-3 px-4 text-black/70">{obat.deskripsi}</td>
                <td className="py-3 px-4">
                  <span className={`font-medium ${getStatusColor(obat.statusObat)}`}>
                    {obat.statusObat}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {informasiObat.length === 0 && (
        <div className="text-center py-8 text-black/60">
          <p>Tidak ada data obat tersedia</p>
        </div>
      )}
    </div>
  );
}
