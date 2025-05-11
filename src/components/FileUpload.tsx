
import { useState } from 'react';
import { Upload, Scan } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const allowedFileTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    
    if (!allowedFileTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only PDF, JPG, JPEG and PNG files are supported",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      toast({ description: `File ${selectedFile.name} uploaded successfully` });
      setSelectedFile(null);
    }, 1500);
  };
  
  const handleScan = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please upload a file first",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate scan process
    toast({ description: "Scanning file... This will connect to backend API in the future" });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">File Upload</h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-700">
            Drag and drop your files here
          </p>
          <p className="text-xs text-gray-500">or</p>
          <div className="mt-4">
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            <label
              htmlFor="fileUpload"
              className="inline-flex cursor-pointer px-4 py-2 bg-kpmg-blue text-white rounded-md hover:bg-kpmg-blue/90 transition-colors"
            >
              Browse Files
            </label>
            
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-700">Selected: {selectedFile.name}</p>
                <div className="flex gap-4 mt-2">
                  <Button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-kpmg-blue hover:bg-kpmg-blue/90 text-white"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                  
                  <Button 
                    onClick={handleScan}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <Scan size={18} />
                    <span>Scan</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-4">Supported files: PDF, JPG, JPEG, PNG</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
