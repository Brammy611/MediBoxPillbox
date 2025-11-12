import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StatistikProps {
  statistik: {
    waktuPengambilanObat: Array<{ hari: string; jumlah: number; tanggal?: string }>;
    analisisWaktuKritis: Array<{ waktu: string; persen: number; label: string; jumlah?: number }>;
    keterangan: string;
    statusKepatuhan: {
      status: string;
      kategori: string;
      persentase?: number;
      detail?: string;
    };
    peringatanStok: string;
    ringkasanHariIni?: {
      diminum: number;
      terlewat: number;
      total: number;
      persentase: number;
    };
  };
}

const COLORS = {
  Pagi: "#FF8F37",
  Siang: "#C73D07",
  Malam: "#451205",
};

export default function PanelStatistik({ statistik }: StatistikProps) {
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

  // Tentukan warna status kepatuhan
  const getStatusColor = (kategori: string) => {
    switch (kategori.toLowerCase()) {
      case 'baik':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-100 text-green-700' };
      case 'perlu perhatian':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-700' };
      case 'peringatan':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-700' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  const statusColors = getStatusColor(statistik.statusKepatuhan.kategori);

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 border border-black/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">📊 Statistik & Analisis</h2>
        {statistik.ringkasanHariIni && (
          <div className="text-right">
            <p className="text-xs text-gray-600">Hari Ini</p>
            <p className="text-sm font-bold text-brand-600">
              {statistik.ringkasanHariIni.diminum}/{statistik.ringkasanHariIni.total} diminum
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Waktu Pengambilan Obat */}
        <div className="min-w-0">
          <h3 className="text-sm font-medium mb-3">📈 Waktu Pengambilan Obat (7 Hari)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={statistik.waktuPengambilanObat}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="hari" 
                style={{ fontSize: "11px" }}
                tick={{ fill: '#666' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                style={{ fontSize: "11px" }}
                tick={{ fill: '#666' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="jumlah"
                stroke="#F97316"
                strokeWidth={2.5}
                dot={{ fill: "#F97316", r: 5 }}
                activeDot={{ r: 7 }}
                name="Jumlah Obat"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Diagram Analisis Waktu Kritis */}
        <div className="min-w-0">
          <h3 className="text-sm font-medium mb-3">⏰ Analisis Waktu Kritis</h3>
          
          {/* Responsive Layout: Pie Chart + Legend */}
          <div className="flex flex-col items-center">
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statistik.analisisWaktuKritis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}  // Disable default label
                  outerRadius={70}
                  innerRadius={0}
                  fill="#8884d8"
                  dataKey="persen"
                  paddingAngle={2}
                >
                  {statistik.analisisWaktuKritis.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.waktu as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend yang Responsive */}
            <div className="w-full mt-2 space-y-1.5">
              {statistik.analisisWaktuKritis.map((entry, index) => (
                <div 
                  key={`legend-${index}`}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-default"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                      className="w-4 h-4 rounded flex-shrink-0"
                      style={{ backgroundColor: COLORS[entry.waktu as keyof typeof COLORS] }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {entry.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900">
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

          <p className="text-xs text-black/60 text-center mt-3">
            {statistik.keterangan}
          </p>
        </div>
      </div>

      {/* Status Kepatuhan & Peringatan */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className={`${statusColors.bg} border ${statusColors.border} rounded-lg p-4`}>
          <h4 className={`text-xs font-medium ${statusColors.text} mb-1`}>
            Status Kepatuhan
          </h4>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${statusColors.text}`}>
              {statistik.statusKepatuhan.status}
            </p>
            {statistik.statusKepatuhan.persentase !== undefined && (
              <span className="text-lg font-semibold text-gray-600">
                ({statistik.statusKepatuhan.persentase}%)
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs px-2 py-1 ${statusColors.badge} rounded font-medium`}>
              {statistik.statusKepatuhan.kategori}
            </span>
          </div>
          {statistik.statusKepatuhan.detail && (
            <p className="text-xs text-gray-600 mt-2">
              {statistik.statusKepatuhan.detail}
            </p>
          )}
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-xs font-medium text-orange-800 mb-1">
            📦 Peringatan Stok
          </h4>
          <p className="text-sm text-orange-700 mt-2 font-medium">
            {statistik.peringatanStok}
          </p>
          {statistik.ringkasanHariIni && statistik.ringkasanHariIni.terlewat > 0 && (
            <div className="mt-3 pt-3 border-t border-orange-200">
              <p className="text-xs text-orange-800 font-medium">
                ⚠️ {statistik.ringkasanHariIni.terlewat} dosis terlewat hari ini
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
