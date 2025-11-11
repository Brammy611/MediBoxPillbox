import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface InteraksiObat {
  obatTerdeteksi: string;
  peringatan: string;
  alasan: string;
}

interface TipsEfekSamping {
  obatTerdeteksi: string;
  efekSampingUmum: string;
  tips: string;
}

interface RekomendasiMakanan {
  id: number;
  judul: string;
  makanan: string[];
  deskripsi: string;
  deskripsiLanjutan?: string;
}

interface SaranPolaMakanData {
  disclaimer: string;
  interaksiObat: InteraksiObat[];
  tipsEfekSamping: TipsEfekSamping;
  rekomendasiMakanan: RekomendasiMakanan[];
  daftarObatTerkait: string[];
}

interface SaranPolaMakanTabProps {
  data: SaranPolaMakanData;
}

const dummyData: SaranPolaMakanData = {
  disclaimer: "Informasi di halaman ini dibuat oleh AI sebagai panduan untuk membantu Anda, INI BUKAN PENGGANTI saran medis profesional. Selalu konsultasikan semua perubahan pola makan atau keluhan tentang obat dengan dokter atau ahli gizi Anda.",
  interaksiObat: [
    {
      obatTerdeteksi: "Amlodipine (Obat Hipertensi)",
      peringatan: "Jangan dikonsumsi bersamaan dengan jus Grapefruit (Jeruk Bali Merah).",
      alasan: "AI mendeteksi bahwa Grapefruit dapat meningkatkan kadar Amlodipine dalam darah, memicu efek samping berlebih seperti pusing atau sakit kepala berlebih."
    },
    {
      obatTerdeteksi: "Simvastatin (Obat Kolesterol)",
      peringatan: "Hindari konsumsi alkohol berlebih.",
      alasan: "Dapat meningkatkan risiko kerusakan hati."
    }
  ],
  tipsEfekSamping: {
    obatTerdeteksi: "Amlodipine (Obat Hipertensi)",
    efekSampingUmum: "Pusing saat berdiri (Hipotensi Ortostatik).",
    tips: "Saran: Sebaiknya minum obat ini sambil duduk sebelum tidur. Ingatkan beliau untuk bangun dari tempat tidur secara perlahan (duduk dulu 30 detik sebelum berdiri) untuk mencegah pusing."
  },
  rekomendasiMakanan: [
    {
      id: 1,
      judul: "1. Untuk Kesehatan Jantung & Hipertensi",
      makanan: ["Pisang", "Apel", "Bayam"],
      deskripsi: "Saran AI: Makanan-makanan ini kaya akan kalium (potassium) yang dapat membantu menyeimbangkan kadar garam (natrium) dan menjaga tekanan darah kakek tetap stabil.",
      deskripsiLanjutan: "Saran AI: Mengandung Omega-3 yang tinggi, yang terbukti baik untuk kesehatan pembuluh darah dan jantung."
    },
    {
      id: 2,
      judul: "2. Untuk Kesehatan Pencernaan & Energi",
      makanan: ["Oatmeal", "Gandum Utuh"],
      deskripsi: "Saran AI: Ini adalah sumber serat larut dan karbohidrat kompleks yang sangat baik. Serat membantu melancarkan pencernaan (mencegah sembelit) dan memberi energi yang tahan lama."
    }
  ],
  daftarObatTerkait: ["Amlodipine", "Simvastatin", "dst."]
};

const SaranPolaMakanTab: React.FC<SaranPolaMakanTabProps> = ({ data }) => {
  // Gunakan data dummy jika data dari props tidak ada
  const displayData = data || dummyData;

  return (
    <div className="space-y-6">
      {/* 1. Disclaimer Box */}
      <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-5 flex items-start gap-4">
        <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900 leading-relaxed">
          {displayData.disclaimer}
        </p>
      </div>

      {/* 2. Waspada Interaksi Obat */}
      <div>
        <h3 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Waspada Interaksi Obat
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayData.interaksiObat?.map((item, index) => (
            <div 
              key={index} 
              className="bg-red-50 border-2 border-red-400 rounded-lg p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-red-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">
                  !
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink mb-1">
                    Obat Terdeteksi: {item.obatTerdeteksi}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <strong className="text-red-800">Peringatan:</strong>{' '}
                  <span className="text-red-900">{item.peringatan}</span>
                </p>
                <p>
                  <strong className="text-red-800">Alasan:</strong>{' '}
                  <span className="text-red-900">{item.alasan}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tips Mengelola Efek Samping */}
      {displayData.tipsEfekSamping && (
        <div>
          <h3 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Tips Mengelola Efek Samping Obat
          </h3>
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-green-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink mb-1">
                  Obat Terdeteksi: {displayData.tipsEfekSamping.obatTerdeteksi}
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-green-800">Efek Samping Umum:</strong>{' '}
                <span className="text-green-900">{displayData.tipsEfekSamping.efekSampingUmum}</span>
              </p>
              <p className="text-green-900 leading-relaxed">
                {displayData.tipsEfekSamping.tips}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Rekomendasi Makanan Pendukung */}
      <div>
        <h3 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
          🍎 Rekomendasi Makanan Pendukung
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayData.rekomendasiMakanan?.map((rec) => (
            <div 
              key={rec.id} 
              className="bg-white border-2 border-brand-500 rounded-lg p-5"
            >
              <h4 className="font-semibold text-ink mb-3">{rec.judul}</h4>
              
              {/* List Makanan */}
              <ul className="mb-3 space-y-1">
                {rec.makanan.map((makanan, i) => (
                  <li 
                    key={i} 
                    className="flex items-center gap-2 text-sm text-black/70"
                  >
                    <span className="text-brand-600">•</span>
                    <span>{makanan}</span>
                  </li>
                ))}
              </ul>

              {/* Deskripsi */}
              <div className="space-y-2 text-sm text-black/70 leading-relaxed">
                <p>{rec.deskripsi}</p>
                {rec.deskripsiLanjutan && (
                  <p>{rec.deskripsiLanjutan}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Daftar Obat Terkait */}
      {displayData.daftarObatTerkait && displayData.daftarObatTerkait.length > 0 && (
        <div className="bg-[#FFF8F0] border border-black/10 rounded-lg p-5">
          <p className="font-semibold text-ink mb-3">
            Saran ini dibuat berdasarkan daftar obat:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            {displayData.daftarObatTerkait.map((obat, i) => (
              <li key={i} className="text-sm text-black/70">
                {obat}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default SaranPolaMakanTab;
