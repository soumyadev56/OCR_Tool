
import { useState } from 'react';

interface ColumnSelectorProps {
  availableColumns: string[];
  selectedColumns: string[];
  onColumnToggle: (column: string) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({ 
  availableColumns, 
  selectedColumns, 
  onColumnToggle 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredColumns = searchTerm 
    ? availableColumns.filter(col => 
        col.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableColumns;
    
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-kpmg-purple mb-4">Column name</h3>
      
      <div className="mb-4">
        <input
          type="text"
          className="w-full border border-gray-300 rounded p-2 text-sm"
          placeholder="Enter Column Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        {filteredColumns.map((column, index) => (
          <div key={index} className="flex items-center">
            <input
              type="checkbox"
              id={`column-${index}`}
              className="w-4 h-4 text-kpmg-blue border-gray-300 rounded focus:ring-kpmg-blue"
              checked={selectedColumns.includes(column)}
              onChange={() => onColumnToggle(column)}
            />
            <label htmlFor={`column-${index}`} className="ml-2 text-sm text-gray-700">
              {column}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnSelector;
