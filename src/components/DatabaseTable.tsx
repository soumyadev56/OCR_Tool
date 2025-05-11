import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditRowDialog from './EditRowDialog';
import AddNewRowDialog from './AddNewRowDialog';

interface TableData {
  id: number;
  fileName: string;
  billDate: string;
  totalAmount: string;
  bankName: string;
  swiftCode: string;
  upiId: string;
  uploadDateTime: string;
  invoiceDate: string;
  taxInvoiceNo: string;
  gstNo: string;
}

interface DatabaseTableProps {
  selectedColumns: string[];
}

const initialData: TableData[] = [
  {
    id: 1,
    fileName: "Invoice_KPMG_001.pdf",
    billDate: '14-07-2025',
    totalAmount: '11,000',
    bankName: 'The Hongkong and Shanghai Banking Corporation Ltd',
    swiftCode: 'KPMG',
    upiId: 'KPMG@HSBC',
    uploadDateTime: 'Mon, 21 Apr 2025 18:17:50 GMT',
    invoiceDate: '13-JAN-25',
    taxInvoiceNo: 'KPMG-HR/007090',
    gstNo: '06AAAFK1513H1ZV'
  },
  {
    id: 2,
    fileName: "Invoice_KPMG_002.pdf",
    billDate: '01-11-2024',
    totalAmount: '9,240',
    bankName: 'The Hongkong and Shanghai Banking Corporation Ltd',
    swiftCode: 'KPMG',
    upiId: 'KPMG@HSBC',
    uploadDateTime: 'Mon, 21 Apr 2025 18:17:50 GMT',
    invoiceDate: '31-OCT-24',
    taxInvoiceNo: 'KPMG-HR/000082',
    gstNo: '06AAAFK1513H1ZV'
  },
  {
    id: 3,
    fileName: "Invoice_KPMG_003.pdf",
    billDate: '12-04-2024',
    totalAmount: '284,162',
    bankName: 'The Hongkong and Shanghai Banking Corporation Ltd',
    swiftCode: 'KPMG',
    upiId: 'KPMG@HSBC',
    uploadDateTime: 'Mon, 21 Apr 2025 18:17:50 GMT',
    invoiceDate: '12-APR-24',
    taxInvoiceNo: 'KPMG-HR/000003',
    gstNo: '06AAAFK1513H1ZV'
  }
];

const DatabaseTable: React.FC<DatabaseTableProps> = ({ selectedColumns }) => {
  const [data, setData] = useState<TableData[]>(initialData);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [editingRow, setEditingRow] = useState<TableData | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Map friendly display names to actual data keys
  const columnMap: Record<string, keyof TableData> = {
    'id': 'id',
    'fileName': 'fileName',
    'billDate': 'billDate',
    'totalAmount': 'totalAmount',
    'bankName': 'bankName',
    'swiftCode': 'swiftCode',
    'upiId': 'upiId',
    'uploadDateTime': 'uploadDateTime',
    'invoiceDate': 'invoiceDate',
    'taxInvoiceNo': 'taxInvoiceNo',
    'gstNo': 'gstNo'
  };

  const displayColumns = selectedColumns.map(col => {
    return {
      name: col,
      key: columnMap[col] || col.toLowerCase().replace(/\s/g, '')
    };
  });

  const handleRowSelect = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map(row => row.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      toast({
        title: "Info",
        description: "No rows selected for deletion",
      });
      return;
    }
    
    // Filter out selected rows
    const updatedData = data.filter(row => !selectedRows.includes(row.id));
    
    // Reassign IDs to be sequential
    const reindexedData = updatedData.map((row, index) => ({
      ...row,
      id: index + 1
    }));
    
    setData(reindexedData);
    setSelectedRows([]);
    
    toast({
      description: `${selectedRows.length} row(s) deleted successfully`,
    });
  };

  const handleEditRow = (row: TableData) => {
    setEditingRow(row);
  };

  const handleSaveEdit = (updatedRow: TableData) => {
    const updatedData = data.map(row => 
      row.id === updatedRow.id ? updatedRow : row
    );
    
    setData(updatedData);
    setEditingRow(null);
    
    toast({
      description: "Row updated successfully",
    });
  };

  const handleAddNewRow = (newRow: Omit<TableData, 'id'>) => {
    const newId = data.length > 0 ? Math.max(...data.map(row => row.id)) + 1 : 1;
    
    const rowWithId = {
      ...newRow,
      id: newId
    };
    
    setData([...data, rowWithId]);
    setIsAddDialogOpen(false);
    
    toast({
      description: "New row added successfully",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Database Preview</h2>
        <div className="flex gap-4">
          <button 
            onClick={handleDeleteSelected}
            disabled={selectedRows.length === 0}
            className="bg-[#ea384c] text-white px-3 py-2 rounded flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete All
          </button>
          
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-white text-kpmg-blue border border-kpmg-blue px-3 py-2 rounded flex items-center gap-2 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New
          </button>
        </div>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-kpmg-blue text-white">
              <TableRow>
                <TableHead className="w-10 text-white">
                  <Checkbox 
                    checked={selectedRows.length === data.length && data.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-white w-20">Actions</TableHead>
                {displayColumns.map((column) => (
                  <TableHead key={column.key} className="text-white whitespace-nowrap">
                    {column.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={displayColumns.length + 2} className="text-center py-4">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox 
                        checked={selectedRows.includes(row.id)}
                        onCheckedChange={() => handleRowSelect(row.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <button 
                        onClick={() => handleEditRow(row)}
                        className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                        title="Edit row"
                      >
                        <Edit size={16} />
                      </button>
                    </TableCell>
                    {displayColumns.map((column) => (
                      <TableCell key={`${row.id}-${column.key}`} className="whitespace-nowrap">
                        {row[column.key as keyof TableData]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingRow && (
        <EditRowDialog
          open={!!editingRow}
          onOpenChange={() => setEditingRow(null)}
          row={editingRow}
          onSave={handleSaveEdit}
        />
      )}

      <AddNewRowDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddNewRow}
      />
    </div>
  );
};

export default DatabaseTable;
