
import { FileText } from 'lucide-react';

interface RecentFile {
  name: string;
  createdDays: number;
}

interface RecentFilesProps {
  files: RecentFile[];
}

const RecentFiles: React.FC<RecentFilesProps> = ({ files }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Recent Files</h3>
      
      <div className="space-y-3">
        {files.map((file, index) => (
          <div 
            key={index} 
            className="flex items-center border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer"
          >
            <FileText size={16} className="text-kpmg-blue mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-700">{file.name}</p>
              <p className="text-xs text-gray-500">{file.createdDays}d</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentFiles;
