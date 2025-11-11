import React from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatsData {
  waktuPengambilanObat: Array<{ hari: string; jumlah: number }>;
  analisisWaktuKritis: Array<{ waktu: string; persen: number; label: string }>;
  statusKepatuhan: string;
  kategoriKepatuhan?: string;
  peringatanStok: string;
}

interface PanelStatistikFamilyProps {
  stats: StatsData;
}

const COLORS = {
  'Pagi': '#FF8042',
  'Siang': '#FFBB28',
  'Malam': '#0088FE'
};

const PanelStatistikFamily: React.FC<PanelStatistikFamilyProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Line Chart - Waktu Pengambilan Obat */}
      <div className="bg-white rounded-lg border border-black/10 p-6">
        <h3 className="text-lg font-semibold text-ink mb-4">line chart</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.waktuPengambilanObat}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hari" 
              tick={{ fontSize: 12 }}
              label={{ value: 'Hari ke -', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="jumlah" 
              stroke="#F97316" 
              strokeWidth={2}
              dot={{ fill: '#F97316', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Analisis Waktu Kritis */}
      <div className="bg-white rounded-lg border border-black/10 p-6">
        <h3 className="text-lg font-semibold text-ink mb-2">Analisis Waktu Kritis</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={stats.analisisWaktuKritis}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="persen"
            >
              {stats.analisisWaktuKritis.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.waktu as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend Custom */}
        <div className="mt-4 space-y-2">
          {stats.analisisWaktuKritis.map((item) => (
            <div key={item.waktu} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: COLORS[item.waktu as keyof typeof COLORS] }}
                />
                <span className="text-black/70">{item.label}</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-black/50 mt-2">*Waktu lansia sering telat minum</p>
        </div>
      </div>

      {/* Status Kepatuhan & Peringatan */}
      <div className="bg-white rounded-lg border border-black/10 p-6">
        <h3 className="text-lg font-semibold text-ink mb-4">Status Kepatuhan</h3>
        
        <div className="space-y-4">
          <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg text-center font-semibold">
            {stats.statusKepatuhan}
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-1">Peringatan</p>
            <p className="text-sm text-yellow-700">{stats.peringatanStok}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelStatistikFamily;
