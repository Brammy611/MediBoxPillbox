import React from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatsData {
  waktuPengambilanObat: Array<{ hari: string; jumlah: number; tanggal?: string }>;
  analisisWaktuKritis: Array<{ waktu: string; persen: number; label: string; jumlah?: number }>;
  statusKepatuhan: {
    status: string;
    color: string;
    persentase?: number;
    detail?: string;
  };
  peringatanStok: string;
  keterangan: string;
  ringkasanHariIni?: {
    diminum: number;
    terlewat: number;
    total: number;
    persentase: number;
  };
}

interface PanelStatistikFamilyProps {
  stats: StatsData;
}

const COLORS = {
  'Pagi': '#FF8F37',
  'Siang': '#C73D07',
  'Malam': '#451205'
};

const PanelStatistikFamily: React.FC<PanelStatistikFamilyProps> = ({ stats }) => {
  // Debug: Log data yang diterima
  React.useEffect(() => {
    console.log('📊 PanelStatistikFamily - Data Stats:', stats);
    console.log('📊 waktuPengambilanObat:', stats?.waktuPengambilanObat);
    console.log('📊 waktuPengambilanObat length:', stats?.waktuPengambilanObat?.length);
    console.log('📊 analisisWaktuKritis:', stats?.analisisWaktuKritis);
    console.log('📊 analisisWaktuKritis length:', stats?.analisisWaktuKritis?.length);
    console.log('📊 statusKepatuhan:', stats?.statusKepatuhan);
    console.log('📊 Processed waktuData:', stats?.waktuPengambilanObat && stats.waktuPengambilanObat.length > 0 ? stats.waktuPengambilanObat : 'USING FALLBACK');
    console.log('📊 Processed waktuKritisData:', stats?.analisisWaktuKritis && stats.analisisWaktuKritis.length > 0 ? stats.analisisWaktuKritis : 'USING FALLBACK');
  }, [stats]);

  // Fallback jika data kosong - pastikan selalu ada data untuk chart
  const waktuData = (stats?.waktuPengambilanObat && stats.waktuPengambilanObat.length > 0)
    ? stats.waktuPengambilanObat 
    : [
        { hari: 'Hari-1', jumlah: 0, tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) },
        { hari: 'Hari-2', jumlah: 0, tanggal: new Date(Date.now() - 1*24*60*60*1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) },
        { hari: 'Hari-3', jumlah: 0, tanggal: new Date(Date.now() - 2*24*60*60*1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) },
        { hari: 'Hari-4', jumlah: 0, tanggal: new Date(Date.now() - 3*24*60*60*1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) },
        { hari: 'Hari-5', jumlah: 0, tanggal: new Date(Date.now() - 4*24*60*60*1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) },
        { hari: 'Hari-6', jumlah: 0, tanggal: new Date(Date.now() - 5*24*60*60*1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) },
        { hari: 'Hari-7', jumlah: 0, tanggal: new Date(Date.now() - 6*24*60*60*1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }
      ];

  const waktuKritisData = (stats?.analisisWaktuKritis && stats.analisisWaktuKritis.length > 0)
    ? stats.analisisWaktuKritis
    : [
        { waktu: 'Pagi', persen: 33, label: 'Pagi', jumlah: 0 },
        { waktu: 'Siang', persen: 33, label: 'Siang', jumlah: 0 },
        { waktu: 'Malam', persen: 34, label: 'Malam', jumlah: 0 }
      ];

  console.log('📊 Processed waktuData:', waktuData);
  console.log('📊 Processed waktuKritisData:', waktuKritisData);

  // Custom tooltip untuk line chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{data.hari}</p>
          {data.tanggal && <p className="text-xs text-gray-600">{data.tanggal}</p>}
          <p className="text-sm text-brand-600 font-bold mt-1">
            {data.jumlah} obat diminum
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip untuk pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm font-bold mt-1">
            {data.value}% ({data.payload.jumlah || 0} kali)
          </p>
        </div>
      );
    }
    return null;
  };

  // Tentukan warna berdasarkan status (dari backend)
  const getStatusColor = (status: string, hexColor: string) => {
    // hexColor dari backend: #10B981 (green/Patuh) atau #EF4444 (red/Tidak Patuh)
    const isPatuh = status === 'Patuh';
    
    if (isPatuh) {
      return { 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        text: 'text-green-800', 
        badge: 'bg-green-100 text-green-700',
        hex: hexColor 
      };
    } else {
      return { 
        bg: 'bg-red-50', 
        border: 'border-red-200', 
        text: 'text-red-800', 
        badge: 'bg-red-100 text-red-700',
        hex: hexColor 
      };
    }
  };

  // Safeguard untuk statusKepatuhan
  const kepatuhanInfo = stats.statusKepatuhan || {
    status: 'Tidak Diketahui',
    color: '#9CA3AF',
    persentase: 0,
    detail: ''
  };

  const statusColors = getStatusColor(kepatuhanInfo.status, kepatuhanInfo.color);

  return (
    <div className="bg-white rounded-xl shadow-soft p-4 sm:p-6 border border-black/5 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
          <span>📊</span>
          <span>Statistik & Analisis</span>
        </h2>
        {stats.ringkasanHariIni && (
          <div className="text-right">
            <p className="text-xs text-gray-600">Hari Ini</p>
            <p className="text-sm sm:text-base font-bold text-brand-600">
              {stats.ringkasanHariIni.diminum}/{stats.ringkasanHariIni.total} diminum
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Grafik Waktu Pengambilan Obat */}
        <div className="min-w-0 bg-gray-50/50 rounded-lg p-4">
          <h3 className="text-sm sm:text-base font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>📈</span>
            <span>Pengambilan Obat (7 Hari)</span>
          </h3>
          {waktuData && waktuData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={waktuData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hari" 
                  style={{ fontSize: "12px" }}
                  tick={{ fill: '#4b5563' }}
                  angle={-45}
                  textAnchor="end"
                  height={65}
                />
                <YAxis 
                  style={{ fontSize: "12px" }}
                  tick={{ fill: '#4b5563' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="jumlah"
                  stroke="#FF8F37"
                  strokeWidth={3}
                  dot={{ fill: "#FF8F37", r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Jumlah Obat"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500 text-sm">Tidak ada data</p>
            </div>
          )}
        </div>

        {/* Diagram Analisis Waktu Kritis */}
        <div className="min-w-0 bg-gray-50/50 rounded-lg p-4">
          <h3 className="text-sm sm:text-base font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>⏰</span>
            <span>Analisis Waktu Kritis</span>
          </h3>
          
          {/* Responsive Layout: Pie Chart + Legend */}
          <div className="flex flex-col items-center">
            {/* Pie Chart */}
            {waktuKritisData && waktuKritisData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={waktuKritisData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={75}
                    innerRadius={0}
                    fill="#8884d8"
                    dataKey="persen"
                    paddingAngle={2}
                  >
                    {waktuKritisData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.waktu as keyof typeof COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[190px] flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500 text-sm">Tidak ada data</p>
              </div>
            )}

            {/* Custom Legend yang Responsive */}
            <div className="w-full mt-3 space-y-2">
              {waktuKritisData.map((entry, index) => (
                <div 
                  key={`legend-${index}`}
                  className="flex items-center justify-between px-4 py-2.5 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-default border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-5 h-5 rounded flex-shrink-0"
                      style={{ backgroundColor: COLORS[entry.waktu as keyof typeof COLORS] }}
                    />
                    <span className="text-sm sm:text-base font-semibold text-gray-800">
                      {entry.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {entry.persen}%
                    </span>
                    {(entry.jumlah || 0) > 0 && (
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        ({entry.jumlah}x)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 text-center mt-4 italic">
            {stats.keterangan || '*Waktu lansia sering telat minum'}
          </p>
        </div>
      </div>

      {/* Status Kepatuhan & Peringatan */}
      <div className="mt-5 sm:mt-6 grid md:grid-cols-2 gap-4 sm:gap-5">
        <div className={`${statusColors.bg} border-2 ${statusColors.border} rounded-xl p-5`}>
          <h4 className={`text-xs sm:text-sm font-semibold ${statusColors.text} mb-2 uppercase tracking-wide`}>
            Status Kepatuhan
          </h4>
          <div className="flex items-baseline gap-2 mb-3">
            <p className={`text-2xl sm:text-3xl font-bold ${statusColors.text}`}>
              {kepatuhanInfo.status}
            </p>
            {kepatuhanInfo.persentase !== undefined && kepatuhanInfo.persentase !== null && (
              <span className="text-lg sm:text-xl font-bold text-gray-600">
                ({kepatuhanInfo.persentase}%)
              </span>
            )}
          </div>
          {kepatuhanInfo.detail && (
            <p className="text-xs sm:text-sm text-gray-700 mt-3 leading-relaxed">
              {kepatuhanInfo.detail}
            </p>
          )}
        </div>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
          <h4 className="text-xs sm:text-sm font-semibold text-orange-800 mb-2 uppercase tracking-wide flex items-center gap-2">
            <span>📦</span>
            <span>Peringatan Stok</span>
          </h4>
          <p className="text-base sm:text-lg md:text-xl text-orange-700 mt-3 font-bold leading-relaxed">
            {stats.peringatanStok}
          </p>
          {stats.ringkasanHariIni && stats.ringkasanHariIni.terlewat > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-orange-200">
              <p className="text-sm sm:text-base text-orange-800 font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{stats.ringkasanHariIni.terlewat} dosis terlewat hari ini</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelStatistikFamily;
