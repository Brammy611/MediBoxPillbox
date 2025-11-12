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
    waktuPengambilanObat: Array<{ hari: string; jumlah: number }>;
    analisisWaktuKritis: Array<{ waktu: string; persen: number; label: string }>;
    keterangan: string;
    statusKepatuhan: {
      status: string;
      kategori: string;
    };
    peringatanStok: string;
  };
}

const COLORS = {
  Pagi: "#FF8F37",
  Siang: "#C73D07",
  Malam: "#451205",
};

export default function PanelStatistik({ statistik }: StatistikProps) {
  return (
    <div className="bg-white rounded-xl shadow-soft p-6 border border-black/5">
      <h2 className="text-lg font-semibold mb-4">Statistik & Analisis</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Grafik Waktu Pengambilan Obat */}
        <div>
          <h3 className="text-sm font-medium mb-3">Waktu Pengambilan Obat</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={statistik.waktuPengambilanObat}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hari" style={{ fontSize: "12px" }} />
              <YAxis style={{ fontSize: "12px" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="jumlah"
                stroke="#F97316"
                strokeWidth={2}
                dot={{ fill: "#F97316", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Diagram Analisis Waktu Kritis */}
        <div>
          <h3 className="text-sm font-medium mb-3">Analisis Waktu Kritis</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statistik.analisisWaktuKritis}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.label}: ${entry.persen}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="persen"
              >
                {statistik.analisisWaktuKritis.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.waktu as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-black/60 text-center mt-2">
            {statistik.keterangan}
          </p>
        </div>
      </div>

      {/* Status Kepatuhan & Peringatan */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-xs font-medium text-green-800 mb-1">
            Status Kepatuhan
          </h4>
          <p className="text-2xl font-bold text-green-600">
            {statistik.statusKepatuhan.status}
          </p>
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded mt-2 inline-block">
            {statistik.statusKepatuhan.kategori}
          </span>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-xs font-medium text-orange-800 mb-1">
            Peringatan Stok
          </h4>
          <p className="text-sm text-orange-700 mt-2">
            {statistik.peringatanStok}
          </p>
        </div>
      </div>
    </div>
  );
}
