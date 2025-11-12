import medibox from "../assets/medibox.png";
import Badge from "../components/Badge";
import Section from "../components/Section";
import StepCard from "../components/StepCard";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-10 mt-8 items-center">
        <div className="relative">
          <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-brand-200/60" />
          <img src={medibox} alt="MediBox device" className="w-72 mx-auto drop-shadow" />
        </div>
        <div>
          <Badge>MediBox</Badge>
          <h1 className="text-3xl mt-2">Smart IoT Pillbox for Better Elderly Care</h1>
          <p className="mt-3 text-black/75 leading-relaxed">
            MediBox adalah sebuah ekosistem <em>Connected Adherence Intelligence</em>, yaitu sebuah platform digital
            yang menghubungkan lansia yang mandiri dengan keluarga yang peduli.
          </p>
        </div>
      </div>

      {/* Latar Belakang */}
      <Section id="latar-belakang" title="Latar Belakang">
        <p>
          Kecemasan jutaan keluarga perantau di Indonesia yang setiap hari bertanya-tanya,
          “Apakah orang tua saya sudah minum obat hari ini?”. Di sisi lain, 1 dari 5 lansia di Indonesia menderita sakit
          yang mengganggu aktivitas, dan 53.8% dari mereka memilih mengobati diri sendiri, di mana risiko lupa,
          salah dosis, atau kebingungan jadwal sangat tinggi.
        </p>
      </Section>

      {/* Cara Kerja */}
      <Section id="cara-kerja" title="Cara Kerja MediBox">
        <div className="grid md:grid-cols-1 gap-5">
          <StepCard index={1} title="Bagi Keluarga (Pengguna Utama)">
            <ol className="list-decimal ms-5 space-y-2">
              <li>Pengguna memasukkan nama lengkap orang tua; bebas dari kerumitan teknologi.</li>
              <li>Langsung hubungkan ke akun MediBox (menggunakan koneksi internet).</li>
              <li>Tekan tombol “Yes” dan pengingat MediBox menyampaikan obatnya.</li>
              <li>Aplikasi mobile menampilkan notifikasi dan riwayat minum obat.</li>
            </ol>
          </StepCard>

          <StepCard
            index={2}
            title="Bagi Keluarga (Pengisi & Pemantau)"
            subtitle="Ketika Anda tidak berada di rumah"
          >
            <ul className="list-disc ms-5 space-y-2">
              <li>Pengisian kotak MediBox mudah: “mata dan telinga” Anda yang selalu siaga.</li>
              <li>Kelola jadwal minum obat, barcode, dan verifikasi stok pada Family Dashboard.</li>
              <li>Notifikasi telat minum, laporan ringkas (2–3 kalimat) dan deskripsi singkat.</li>
            </ul>
          </StepCard>

          <StepCard
            index={3}
            title="Bagi Pharmacy Partner"
            subtitle="Kolaborasi monitoring obat harian"
          >
            <ul className="list-disc ms-5 space-y-2">
              <li>Pharmacy memindai QR code pada kotak lansia dan langsung terhubung ke MediBox.</li>
              <li>Notifikasi refill, penjadwalan kunjungan, dan riwayat kepatuhan pasien.</li>
              <li>Laporan ringkas berbasis data sebagai bahan komunikasi keluarga–pharmacy.</li>
            </ul>
          </StepCard>
        </div>
      </Section>
    </div>
  );
}
