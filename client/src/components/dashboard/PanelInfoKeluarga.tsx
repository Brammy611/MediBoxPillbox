import React from "react";

interface InfoKeluargaProps {
  informasiKeluarga: {
    nama: string;
    email: string;
    hubunganDenganLansia: string;
    alamat: string;
    noHp: string;
    jenisKelamin: string;
  };
}

export default function PanelInfoKeluarga({ informasiKeluarga }: InfoKeluargaProps) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-soft p-6 border border-orange-200">
      <h2 className="text-lg font-semibold mb-4 text-orange-900">
        Informasi Keluarga
      </h2>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Nama:</p>
          <p className="text-sm text-orange-900">{informasiKeluarga.nama}</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Email:</p>
          <p className="text-sm text-orange-900">{informasiKeluarga.email}</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Hubungan dengan Lansia:</p>
          <p className="text-sm text-orange-900">{informasiKeluarga.hubunganDenganLansia}</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Alamat:</p>
          <p className="text-sm text-orange-900">{informasiKeluarga.alamat}</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">No Hp:</p>
          <p className="text-sm text-orange-900">{informasiKeluarga.noHp}</p>
        </div>

        <div>
          <p className="text-xs text-orange-700 font-medium mb-1">Jenis Kelamin:</p>
          <p className="text-sm text-orange-900">{informasiKeluarga.jenisKelamin}</p>
        </div>
      </div>
    </div>
  );
}
