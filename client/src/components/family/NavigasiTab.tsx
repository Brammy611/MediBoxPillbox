import React from 'react';

interface NavigasiTabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  'Family Profile',
  'Medicine Setup',
  'Saran Pola Makan',
  'Cek Gejala Mandiri',
  'Notifikasi'
];

const NavigasiTab: React.FC<NavigasiTabProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white border-2 border-brand-500 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-brand-500 text-white'
                : 'bg-transparent text-brand-500 hover:bg-brand-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigasiTab;
