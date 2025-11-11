import React from 'react';

interface AnalysisItem {
  label: string;
  score?: number;
  detail?: string;
}

interface BotMessageProps {
  text: string;
  analysis?: AnalysisItem[];
  warning?: { level: string; text: string };
  recommendations?: string[];
}

const BotMessage: React.FC<BotMessageProps> = ({ text, analysis = [], warning, recommendations = [] }) => {
  return (
    <div className="bg-white/90 shadow-sm rounded-lg p-4 border border-gray-100">
      <p className="text-sm text-ink mb-2">{text}</p>

      {analysis.length > 0 && (
        <div className="mt-2">
          <h4 className="text-sm font-semibold">Analisis</h4>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {analysis.map((a, idx) => (
              <li key={idx}>
                <strong>{a.label}:</strong> {a.detail || ''} {a.score ? `(${Math.round((a.score || 0) * 100)}%)` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warning && (
        <div className="mt-3 p-3 rounded border-l-4 border-yellow-400 bg-yellow-50">
          <strong className="text-sm">Peringatan ({warning.level}):</strong>
          <p className="text-sm">{warning.text}</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-semibold">Rekomendasi</h4>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BotMessage;
