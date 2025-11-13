import React from "react";

interface AktivitasProps {
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
}

export default function PanelAktivitas({ aktivitas }: AktivitasProps) {
  return (
    <div className="bg-white rounded-xl shadow-soft p-6 border border-black/5">
      <h2 className="text-lg font-semibold mb-4">Riwayat Aktivitas Real-Time</h2>

      {/* Tabel Aktivitas */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10">
              <th className="text-left py-2 px-3 font-medium">Waktu</th>
              <th className="text-left py-2 px-3 font-medium">Jumlah Obat</th>
              <th className="text-left py-2 px-3 font-medium">Status</th>
              <th className="text-left py-2 px-3 font-medium">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {aktivitas.riwayatRealTime.map((item, index) => (
              <tr key={index} className="border-b border-black/5">
                <td className="py-3 px-3 text-black/70">{item.waktu}</td>
                <td className="py-3 px-3">{item.namaObat}</td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      item.status === "Diminum"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.statusIcon} {item.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-black/70">{item.deskripsi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Missed & Anomali */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-xs font-medium text-red-800 mb-1">
            Total Missed Hari Ini
          </h4>
          <p className="text-4xl font-bold text-red-600">
            {aktivitas.totalMissedHariIni}
          </p>
        </div>

        <div
          className={`border rounded-lg p-4 ${
            aktivitas.deteksiAnomali.tingkatKeparahan === "tinggi"
              ? "bg-orange-50 border-orange-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <h4
            className={`text-xs font-medium mb-1 ${
              aktivitas.deteksiAnomali.tingkatKeparahan === "tinggi"
                ? "text-orange-800"
                : "text-yellow-800"
            }`}
          >
            Deteksi Anomali
          </h4>
          <p
            className={`text-sm ${
              aktivitas.deteksiAnomali.tingkatKeparahan === "tinggi"
                ? "text-orange-700"
                : "text-yellow-700"
            }`}
          >
            {aktivitas.deteksiAnomali.pesan}
          </p>
        </div>
      </div>
    </div>
  );
}
