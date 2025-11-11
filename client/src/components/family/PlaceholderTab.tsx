import React from 'react';

interface PlaceholderTabProps {
  tabName: string;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ tabName }) => {
  return (
    <div className="bg-white rounded-lg border border-black/10 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="bg-brand-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📋</span>
        </div>
        <h3 className="text-2xl font-semibold text-ink mb-2">{tabName}</h3>
        <p className="text-black/60">
          Konten untuk halaman ini sedang dalam pengembangan.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderTab;
