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
    <div className="bg-white border-2 border-brand-500 rounded-xl p-3 sm:p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
              activeTab === tab
                ? 'bg-brand-500 text-white shadow-md scale-105'
                : 'bg-transparent text-brand-500 hover:bg-brand-50 hover:scale-105'
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
