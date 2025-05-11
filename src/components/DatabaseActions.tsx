
import { Database, Upload, Table } from 'lucide-react';

const DatabaseActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-kpmg-blue text-center py-6 px-4 rounded-lg cursor-pointer hover:bg-opacity-90 transition-colors">
        <div className="flex justify-center mb-4">
          <Database size={48} color="white" />
        </div>
        <h3 className="text-xl font-semibold text-white uppercase">Database</h3>
      </div>
      
      <div className="bg-kpmg-blue text-center py-6 px-4 rounded-lg cursor-pointer hover:bg-opacity-90 transition-colors">
        <div className="flex justify-center mb-4">
          <Upload size={48} color="white" />
        </div>
        <h3 className="text-xl font-semibold text-white uppercase">Upload</h3>
      </div>
      
      <div className="bg-kpmg-blue text-center py-6 px-4 rounded-lg cursor-pointer hover:bg-opacity-90 transition-colors">
        <div className="flex justify-center mb-4">
          <Table size={48} color="white" />
        </div>
        <h3 className="text-xl font-semibold text-white uppercase">Master Table</h3>
      </div>
    </div>
  );
};

export default DatabaseActions;
