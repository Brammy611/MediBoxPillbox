import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

// === TypeScript Interfaces ===
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
  penyakit?: string;
  daftarObat?: string[];
}

// === Dummy Data sebagai fallback ===
const dummyData: SaranPolaMakanData = {
  disclaimer: "Informasi ini dibuat oleh AI sebagai panduan. BUKAN pengganti saran medis profesional.",
  interaksiObat: [
    {
      obatTerdeteksi: "Amlodipine",
      peringatan: "Jangan dikonsumsi bersamaan dengan jus Grapefruit.",
      alasan: "Grapefruit meningkatkan kadar Amlodipine dalam darah."
    }
  ],
  tipsEfekSamping: {
    obatTerdeteksi: "Amlodipine",
    efekSampingUmum: "Pusing saat berdiri",
    tips: "Minum sambil duduk sebelum tidur. Bangun perlahan untuk mencegah pusing."
  },
  rekomendasiMakanan: [
    {
      id: 1,
      judul: "Untuk Kesehatan Jantung & Hipertensi",
      makanan: ["Pisang", "Apel", "Bayam"],
      deskripsi: "Makanan kaya kalium yang menyeimbangkan kadar garam dan menjaga tekanan darah stabil.",
      deskripsiLanjutan: "Mengandung Omega-3 yang baik untuk kesehatan jantung."
    }
  ],
  daftarObatTerkait: ["Amlodipine"]
};

// === Komponen Utama ===
const SaranPolaMakanTab: React.FC<SaranPolaMakanTabProps> = ({
  penyakit = "Asam Lambung",
  daftarObat = ["Omeprazole, Magnesium hidroksida"]
}) => {
  const [aiData, setAiData] = useState<SaranPolaMakanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === mapping Gemini response ke tipe frontend ===
  const mapGeminiToFrontend = (geminiData: any): SaranPolaMakanData => {
    return {
      disclaimer: "Informasi ini dibuat oleh AI sebagai panduan. BUKAN pengganti saran medis profesional.",
      interaksiObat: geminiData.interaksiObatMakanan
        ? [{
            obatTerdeteksi: geminiData.interaksiObatMakanan.obat,
            peringatan: geminiData.interaksiObatMakanan.peringatan,
            alasan: geminiData.interaksiObatMakanan.alasan,
          }]
        : [],
      tipsEfekSamping: geminiData.tipsEfekSamping
        ? {
            obatTerdeteksi: geminiData.tipsEfekSamping.obat,
            efekSampingUmum: geminiData.tipsEfekSamping.efekUmum,
            tips: geminiData.tipsEfekSamping.saran,
          }
        : { obatTerdeteksi: "", efekSampingUmum: "", tips: "" },
      rekomendasiMakanan: geminiData.rekomendasiMakanan?.map((r: any, idx: number) => ({
        id: idx,
        judul: r.kategori,
        makanan: r.items,
        deskripsi: r.saran,
      })) || [],
      daftarObatTerkait: geminiData.interaksiObatMakanan
        ? [geminiData.interaksiObatMakanan.obat]
        : []
    };
  };


  const handleFetch = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log("[Gemini] Fetching AI data for:", penyakit, daftarObat);
    const response = await fetch("/api/gemini/saran-pola-makan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ penyakit, daftarObat })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Gagal mengambil data dari server.");
    }

    const geminiResult = await response.json();
    console.log("[Gemini] Backend response:", geminiResult);

    const mappedData = mapGeminiToFrontend(geminiResult);
    setAiData(mappedData);

  } catch (err: any) {
    console.error("[Gemini] Error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  const displayData = aiData || dummyData;

  return (
    <div className="space-y-6">
      {/* Tombol fetch AI */}
      <div>
        <button
          onClick={handleFetch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Memuat..." : "Ambil Saran AI"}
        </button>
        {error && (
          <p className="text-red-600 mt-2 text-sm">Error: {error}</p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-5 flex items-start gap-4">
        <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900 leading-relaxed">{displayData.disclaimer}</p>
      </div>

      {/* Interaksi Obat */}
      <div>
        <h3 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Waspada Interaksi Obat
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayData.interaksiObat?.map((item, idx) => (
            <div key={idx} className="bg-red-50 border-2 border-red-400 rounded-lg p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-red-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">!</div>
                <div className="flex-1">
                  <p className="font-semibold text-ink mb-1">Obat Terdeteksi: {item.obatTerdeteksi}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong className="text-red-800">Peringatan:</strong> <span className="text-red-900">{item.peringatan}</span></p>
                <p><strong className="text-red-800">Alasan:</strong> <span className="text-red-900">{item.alasan}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Efek Samping */}
      {displayData.tipsEfekSamping && (
        <div>
          <h3 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Tips Mengelola Efek Samping Obat
          </h3>
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-green-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">✓</div>
              <div className="flex-1">
                <p className="font-semibold text-ink mb-1">Obat Terdeteksi: {displayData.tipsEfekSamping.obatTerdeteksi}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <p><strong className="text-green-800">Efek Samping Umum:</strong> <span className="text-green-900">{displayData.tipsEfekSamping.efekSampingUmum}</span></p>
              <p className="text-green-900 leading-relaxed">{displayData.tipsEfekSamping.tips}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rekomendasi Makanan */}
      <div>
        <h3 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">🍎 Rekomendasi Makanan Pendukung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayData.rekomendasiMakanan?.map(rec => (
            <div key={rec.id} className="bg-white border-2 border-brand-500 rounded-lg p-5">
              <h4 className="font-semibold text-ink mb-3">{rec.judul}</h4>
              <ul className="mb-3 space-y-1">
                {rec.makanan.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-black/70">
                    <span className="text-brand-600">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-sm text-black/70 leading-relaxed">
                <p>{rec.deskripsi}</p>
                {rec.deskripsiLanjutan && <p>{rec.deskripsiLanjutan}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daftar Obat Terkait */}
      {displayData.daftarObatTerkait?.length > 0 && (
        <div className="bg-[#FFF8F0] border border-black/10 rounded-lg p-5">
          <p className="font-semibold text-ink mb-3">Saran ini dibuat berdasarkan daftar obat:</p>
          <ol className="list-decimal list-inside space-y-1">
            {displayData.daftarObatTerkait.map((obat, i) => (
              <li key={i} className="text-sm text-black/70">{obat}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default SaranPolaMakanTab;
