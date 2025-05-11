
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

interface EditRowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: TableData;
  onSave: (updatedRow: TableData) => void;
}

const EditRowDialog: React.FC<EditRowDialogProps> = ({
  open,
  onOpenChange,
  row,
  onSave,
}) => {
  const [formData, setFormData] = useState<TableData>({...row});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Row</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="fileName" className="form-label">File Name</label>
              <input
                id="fileName"
                name="fileName"
                value={formData.fileName}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="billDate" className="form-label">Bill Date</label>
              <input
                id="billDate"
                name="billDate"
                value={formData.billDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="totalAmount" className="form-label">Total Amount</label>
              <input
                id="totalAmount"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="bankName" className="form-label">Bank Name</label>
              <input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="swiftCode" className="form-label">Swift Code</label>
              <input
                id="swiftCode"
                name="swiftCode"
                value={formData.swiftCode}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="upiId" className="form-label">UPI ID</label>
              <input
                id="upiId"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="uploadDateTime" className="form-label">Upload Date Time</label>
              <input
                id="uploadDateTime"
                name="uploadDateTime"
                value={formData.uploadDateTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="invoiceDate" className="form-label">Invoice Date</label>
              <input
                id="invoiceDate"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="taxInvoiceNo" className="form-label">Tax Invoice No</label>
              <input
                id="taxInvoiceNo"
                name="taxInvoiceNo"
                value={formData.taxInvoiceNo}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gstNo" className="form-label">GST No</label>
              <input
                id="gstNo"
                name="gstNo"
                value={formData.gstNo}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRowDialog;
