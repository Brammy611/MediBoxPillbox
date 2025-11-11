import React from 'react';

interface LoginPromptProps {
  onMasuk: () => void;
  onDaftar: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onMasuk, onDaftar }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white border-2 border-brand-500 rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold text-ink mb-2">
          Anda Belum Login Sebagai Family
        </h2>
        <p className="text-black/60 mb-6">
          Silakan masuk ke akun anda
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={onMasuk}
            className="px-6 py-2.5 border-2 border-brand-500 text-brand-500 rounded-md font-medium hover:bg-brand-50 transition-colors"
          >
            Masuk
          </button>
          <button
            onClick={onDaftar}
            className="px-6 py-2.5 bg-brand-500 text-white rounded-md font-medium hover:bg-brand-600 transition-colors"
          >
            Daftar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
