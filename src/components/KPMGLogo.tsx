
import React from 'react';

const KPMGLogo: React.FC = () => {
  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-1">
          <div className="w-14 h-14 border-2 border-white"></div>
          <div className="w-14 h-14 border-2 border-white"></div>
          <div className="w-14 h-14 border-2 border-white"></div>
          <div className="w-14 h-14 border-2 border-white"></div>
        </div>
      </div>
      <div className="text-white text-center text-6xl font-bold mt-4">KPMG</div>
    </div>
  );
};

export default KPMGLogo;
