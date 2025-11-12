import medibox from "../assets/medibox.png";
import Badge from "../components/Badge";
import Section from "../components/Section";
import StepCard from "../components/StepCard";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-12 mt-12 mb-16 items-center">
        <div className="relative">
          <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-brand-200/60" />
          <img src={medibox} alt="MediBox device" className="w-80 mx-auto drop-shadow-lg" />
        </div>
        <div>
          <Badge>MediBox</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 leading-tight">Smart IoT Pillbox for Better Elderly Care</h1>
          <p className="mt-4 text-base text-black/75 leading-relaxed">
            MediBox adalah sebuah ekosistem <em>Connected Adherence Intelligence</em>, yaitu sebuah platform digital
            yang menghubungkan lansia yang mandiri dengan keluarga yang peduli.
          </p>
        </div>
      </div>

      {/* Latar Belakang */}
      <Section id="latar-belakang" title="Latar Belakang">
        <p className="text-base">
          Kecemasan jutaan keluarga perantau di Indonesia yang setiap hari bertanya-tanya,
          "Apakah orang tua saya sudah minum obat hari ini?". Di sisi lain, 1 dari 5 lansia di Indonesia menderita sakit
          yang mengganggu aktivitas, dan 53.8% dari mereka memilih mengobati diri sendiri, di mana risiko lupa,
          salah dosis, atau kebingungan jadwal sangat tinggi.
        </p>
      </Section>

      {/* Cara Kerja */}
      <Section id="cara-kerja" title="Cara Kerja MediBox">
        <div className="grid md:grid-cols-1 gap-6">
          <StepCard index={1} title="Bagi Lansia (Pengguna Utama)">
            <p className="mb-4 text-black/75">
              Pengalaman lansia kami rancang agar semudah mungkin, bebas dari kerumitan teknologi.
            </p>
            <ul className="list-disc ms-5 space-y-2.5">
              <li>Pada jadwal minum obat, MediBox akan berbunyi (menggunakan buzzer internal).</li>
              <li>Lansia cukup menekan tombol "Yes" dan menunggu MediBox menyiapkan obatnya.</li>
              <li>Setelah itu, lansia bisa meminum obat yang telah dijadwalkan oleh keluarga/apoteker.</li>
            </ul>
          </StepCard>

          <StepCard
            index={2}
            title="Bagi Kerabat/Keluarga (Pengisi & Pemantau)"
          >
            <p className="mb-4 text-black/75">
              Bagi kerabat, MediBox adalah "mata dan telinga" Anda yang cerdas di rumah.
            </p>
            
            <h4 className="font-semibold text-ink mt-5 mb-3">Cara Pengisian:</h4>
            <ul className="list-disc ms-5 space-y-2.5">
              <li>Keluarga mengisi 4 sekat obat.</li>
              <li>Melalui website MediBox, kerabat melakukan scan barcode yang tertera pada kotak MediBox dan melakukan registrasi pada menu Family Dashboard.</li>
              <li>Input teks manual untuk melabeli setiap sekat obat (Sekat 1: "Amoxicillin") yang sudah diberikan resep dokter.</li>
              <li>Input deskripsi obat lainnya seperti cara pemakaian (2x sehari, 3x sehari) dan deskripsi obat.</li>
            </ul>

            <h4 className="font-semibold text-ink mt-5 mb-3">Fitur Pemantauan:</h4>
            <ul className="list-disc ms-5 space-y-2.5">
              <li><strong>Pemantauan Real-Time:</strong> Terdapat dashboard di handphone Anda yang menunjukkan status "Sudah Diminum" atau "Terlewat" secara real-time.</li>
              <li><strong>Klasifikasi Kepatuhan (AI):</strong> Didukung oleh Qualcomm AI Hub, sistem kami secara otomatis menganalisis pola perilaku lansia dan mengklasifikasikannya menjadi: Patuh, Kurang Patuh (Medium), atau Tidak Patuh. Anda tidak hanya tahu data, tapi juga trennya.</li>
              <li><strong>Prediksi Stok Habis:</strong> Sistem kami secara cerdas menghitung sisa obat. Anda akan menerima notifikasi 3 hari sebelum obat di kotak habis, memberi Anda waktu untuk membeli atau mengirim obat baru.</li>
              <li><strong>Saran Pola Makan (AI):</strong> Berdasarkan data obat yang Anda input secara manual, AI kami akan memberikan saran pola makan yang aman dan relevan untuk mendukung pengobatan lansia.</li>
            </ul>
          </StepCard>

          <StepCard
            index={3}
            title="Bagi Apoteker Mitra"
          >
            <p className="mb-4 text-black/75">
              Bagi Apoteker Mitra, mereka dapat mengisi obat lansia Anda langsung pada kotak MediBox.
            </p>
            
            <h4 className="font-semibold text-ink mt-5 mb-3">Cara Pengisian:</h4>
            <ul className="list-disc ms-5 space-y-2.5">
              <li>Apoteker dapat memindai QR Code unik di MediBox.</li>
              <li>Apoteker mengisikan nama dan nomor ID unique yang telah diberikan MediBox kepada mitra apoteker.</li>
              <li>Sistem akan menampilkan daftar obat dan jadwal yang telah di-input oleh kerabat. Ini mempermudah proses refill (isi ulang) dan mengurangi risiko kesalahan pemberian obat oleh apoteker.</li>
              <li>Apoteker juga dapat mengisi obat berdasarkan saran dari resep dokter dan melakukan pengisian informasi obat.</li>
            </ul>
          </StepCard>
        </div>
      </Section>
    </div>
  );
}
