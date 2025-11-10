import React from "react";

interface InfoPasienProps {
  informasiPasien: {
    nama: string;
    umur: number;
    jenisKelamin: string;
    alamatLansia: string;
    riwayatAlergi: string;
    riwayatPenyakit: string;
  };
}

export default function PanelInfoPasien({ informasiPasien }: InfoPasienProps) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-soft p-6 border border-orange-200">
      <h2 className="text-lg font-semibold mb-4 text-orange-900">
        Informasi Lansia
      </h2>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Nama:</p>
          <p className="text-sm text-orange-900">{informasiPasien.nama}</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Umur:</p>
          <p className="text-sm text-orange-900">{informasiPasien.umur} Tahun</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Jenis Kelamin:</p>
          <p className="text-sm text-orange-900">{informasiPasien.jenisKelamin}</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Alamat Lansia:</p>
          <p className="text-sm text-orange-900">{informasiPasien.alamatLansia}</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Riwayat Alergi:</p>
          <p className="text-sm text-orange-900">{informasiPasien.riwayatAlergi}</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Riwayat Penyakit:</p>
          <p className="text-sm text-orange-900">{informasiPasien.riwayatPenyakit}</p>
        </div>
      </div>
    </div>
  );
}
