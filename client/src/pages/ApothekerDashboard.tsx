import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface MedicineRow {
  _id: string;
  name: string;
  dosage?: string;
  section_number?: number;
  compartmentNumber?: number;
  quantity_in_box?: number;
  stock?: number;
  status?: string;
  storage_temp_limit?: number;
  schedule?: Array<{ time?: string; dose?: number }>;
}

export default function ApothekerDashboard() {
  const [data, setData] = useState<MedicineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  // For now pick first patient automatically like other dashboard, could be replaced by selector
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // load patients
        const p = await axios.get(`${API_BASE}/api/dashboard/patients`);
        if (p.data?.success && p.data.patients.length > 0) {
          setPatients(p.data.patients);
          const first = p.data.patients[0]._id;
          setPatientId(first);
          // load medicines for that patient
          const meds = await axios.get(`${API_BASE}/api/medicines/patient/${first}`);
          if (meds.data?.success) {
            setData(meds.data.medicines);
          } else {
            setError(meds.data?.message || 'Gagal memuat data obat');
          }
        } else {
          setError('Tidak ada pasien');
        }
      } catch (e: any) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const deriveStatus = (m: MedicineRow) => {
    if (m.status) return m.status;
    const qty = typeof m.quantity_in_box === 'number' ? m.quantity_in_box : (typeof m.stock === 'number' ? m.stock : undefined);
    if (qty === undefined) return 'Tersedia';
    if (qty <= 0) return 'Habis';
    if (qty <= 5) return 'Hampir Habis';
    return 'Tersedia';
  };

  if (loading) return <div className="p-8 text-sm text-black/60">Memuat data obat...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Apotheker Dashboard</h1>
        {patients.length > 1 && (
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={patientId || ''}
            onChange={async (e) => {
              const val = e.target.value;
              setPatientId(val);
              setLoading(true);
              try {
                const meds = await axios.get(`${API_BASE}/api/medicines/patient/${val}`);
                if (meds.data?.success) setData(meds.data.medicines); else setError(meds.data?.message || 'Gagal memuat data obat');
              } catch (er: any) {
                setError(er.response?.data?.message || er.message);
              } finally { setLoading(false); }
            }}
          >
            {patients.map(p => <option key={p._id} value={p._id}>{p.name || p.username || p._id}</option>)}
          </select>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-orange-100 text-orange-900">
            <tr>
              <th className="text-left px-3 py-2">No.Sekat</th>
              <th className="text-left px-3 py-2">Nama Obat</th>
              <th className="text-left px-3 py-2">Dosage</th>
              <th className="text-left px-3 py-2">Qty</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Temp Limit</th>
              <th className="text-left px-3 py-2">Schedule</th>
            </tr>
          </thead>
          <tbody>
            {data.map(m => {
              const noSekat = m.compartmentNumber ?? m.section_number ?? '-';
              const qty = m.quantity_in_box ?? m.stock ?? '-';
              const status = deriveStatus(m);
              return (
                <tr key={m._id} className="border-b last:border-none">
                  <td className="px-3 py-2">{noSekat}</td>
                  <td className="px-3 py-2 font-medium">{m.name}</td>
                  <td className="px-3 py-2">{m.dosage || '-'}</td>
                  <td className="px-3 py-2">{qty}</td>
                  <td className="px-3 py-2">
                    <span className={
                      status === 'Habis' ? 'text-red-600' : status === 'Hampir Habis' ? 'text-orange-600' : 'text-green-600'
                    }>
                      {status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{m.storage_temp_limit ? `${m.storage_temp_limit}°C` : '-'}</td>
                  <td className="px-3 py-2">{
                    Array.isArray(m.schedule) && m.schedule.length > 0
                      ? m.schedule.map((s,i)=>(<span key={i} className="inline-block mr-1 bg-orange-50 px-1 rounded">{s.time || '?'} ({s.dose || 1})</span>))
                      : '-'
                  }</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
