import { useState, useRef } from 'react';
import { Upload, Download, FileText, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { toast } from 'sonner';

interface BulkProductCSVProps {
  products: Product[];
}

interface CSVRow {
  name: string;
  price: string;
  original_price?: string;
  category: string;
  material: string;
  size: string;
  color: string;
  description?: string;
  image?: string;
  images?: string;
  features?: string;
  care_instructions?: string;
  in_stock?: string;
  featured?: string;
  stock_quantity?: string;
  id?: string; // For updates
}

interface ImportResult {
  success: boolean;
  row: number;
  name: string;
  message: string;
  action: 'created' | 'updated' | 'failed';
}

const CSV_HEADERS = [
  'id',
  'name',
  'price',
  'original_price',
  'category',
  'material',
  'size',
  'color',
  'description',
  'image',
  'images',
  'features',
  'care_instructions',
  'in_stock',
  'featured',
  'stock_quantity'
];

const DEMO_CSV = `name,price,original_price,category,material,size,color,description,image,images,features,care_instructions,in_stock,featured,stock_quantity
Classic Wooden Frame,1299,1599,wooden,Solid Wood,8x10 inches,Natural Brown,Beautiful handcrafted wooden frame,/placeholder.svg,"",Premium quality wood|Hand polished finish|Wall mount ready,Keep away from direct sunlight|Clean with dry cloth,true,true,15
Modern Metal Frame,899,1199,metal,Aluminum,6x8 inches,Silver,Sleek modern aluminum frame,/placeholder.svg,"",Rust resistant|Lightweight|Easy to hang,Wipe with soft cloth|Avoid abrasive cleaners,true,false,20
Vintage Gold Frame,1599,1999,vintage,Wood with Gold Leaf,10x12 inches,Antique Gold,Elegant vintage style frame,/placeholder.svg,"",Genuine gold leaf|Aged finish|Museum quality,Handle with care|Dust gently,true,true,8`;

export const BulkProductCSV = ({ products }: BulkProductCSVProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [csvPreview, setCsvPreview] = useState<CSVRow[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim().replace(/^"|"$/g, '') || '';
      });
      
      rows.push(row);
    }
    
    return rows;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    
    return result;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        toast.error('No valid data found in CSV');
        return;
      }
      
      setCsvPreview(parsed);
      setImportResults([]);
      setShowResults(false);
      setIsImportDialogOpen(true);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImport = async () => {
    setIsProcessing(true);
    setProgress(0);
    const results: ImportResult[] = [];

    for (let i = 0; i < csvPreview.length; i++) {
      const row = csvPreview[i];
      setProgress(Math.round(((i + 1) / csvPreview.length) * 100));

      try {
        // Validate required fields
        if (!row.name || !row.price) {
          results.push({
            success: false,
            row: i + 2,
            name: row.name || 'Unknown',
            message: 'Missing required fields (name, price)',
            action: 'failed'
          });
          continue;
        }

        const productData = {
          name: row.name,
          price: parseFloat(row.price) || 0,
          original_price: row.original_price ? parseFloat(row.original_price) : null,
          category: row.category || 'wooden',
          material: row.material || 'Wood',
          size: row.size || '8x10 inches',
          color: row.color || 'Natural',
          description: row.description || null,
          image: row.image || '/placeholder.svg',
          images: row.images ? row.images.split('|').filter(Boolean) : [],
          features: row.features ? row.features.split('|').filter(Boolean) : [],
          care_instructions: row.care_instructions ? row.care_instructions.split('|').filter(Boolean) : [],
          in_stock: row.in_stock?.toLowerCase() !== 'false',
          featured: row.featured?.toLowerCase() === 'true',
          stock_quantity: parseInt(row.stock_quantity || '10') || 10
        };

        // Check if this is an update (has ID and exists)
        const existingProduct = row.id ? products.find(p => p.id === row.id) : null;

        if (existingProduct) {
          await updateProduct.mutateAsync({ id: row.id!, ...productData });
          results.push({
            success: true,
            row: i + 2,
            name: row.name,
            message: 'Updated successfully',
            action: 'updated'
          });
        } else {
          await createProduct.mutateAsync(productData);
          results.push({
            success: true,
            row: i + 2,
            name: row.name,
            message: 'Created successfully',
            action: 'created'
          });
        }
      } catch (error: any) {
        results.push({
          success: false,
          row: i + 2,
          name: row.name || 'Unknown',
          message: error.message || 'Unknown error',
          action: 'failed'
        });
      }
    }

    setImportResults(results);
    setShowResults(true);
    setIsProcessing(false);

    const created = results.filter(r => r.action === 'created').length;
    const updated = results.filter(r => r.action === 'updated').length;
    const failed = results.filter(r => r.action === 'failed').length;

    if (failed === 0) {
      toast.success(`Import complete! Created: ${created}, Updated: ${updated}`);
    } else {
      toast.warning(`Import complete with errors. Created: ${created}, Updated: ${updated}, Failed: ${failed}`);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      CSV_HEADERS.join(','),
      ...products.map(p => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.price,
        p.original_price || '',
        p.category,
        `"${p.material.replace(/"/g, '""')}"`,
        p.size,
        p.color,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        p.image,
        `"${(p.images || []).join('|')}"`,
        `"${(p.features || []).join('|')}"`,
        `"${(p.care_instructions || []).join('|')}"`,
        p.in_stock,
        p.featured,
        p.stock_quantity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success(`Exported ${products.length} products to CSV`);
  };

  const downloadDemoCSV = () => {
    const blob = new Blob([DEMO_CSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products_demo_template.csv';
    link.click();
    
    toast.success('Demo CSV template downloaded');
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button 
          variant="outline" 
          className="rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full"
          onClick={exportToCSV}
          disabled={products.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button 
          variant="ghost" 
          className="rounded-full"
          onClick={downloadDemoCSV}
        >
          <FileText className="h-4 w-4 mr-2" />
          Demo Template
        </Button>
      </div>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
            <DialogDescription>
              Review the data below before importing. Products with existing IDs will be updated.
            </DialogDescription>
          </DialogHeader>

          {isProcessing ? (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-foreground font-medium">Importing products...</p>
                <p className="text-muted-foreground text-sm">{progress}% complete</p>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          ) : showResults ? (
            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                <div className="text-center px-4 py-2 bg-green-100 rounded-xl">
                  <p className="text-2xl font-bold text-green-700">{importResults.filter(r => r.action === 'created').length}</p>
                  <p className="text-xs text-green-600">Created</p>
                </div>
                <div className="text-center px-4 py-2 bg-blue-100 rounded-xl">
                  <p className="text-2xl font-bold text-blue-700">{importResults.filter(r => r.action === 'updated').length}</p>
                  <p className="text-xs text-blue-600">Updated</p>
                </div>
                <div className="text-center px-4 py-2 bg-red-100 rounded-xl">
                  <p className="text-2xl font-bold text-red-700">{importResults.filter(r => r.action === 'failed').length}</p>
                  <p className="text-xs text-red-600">Failed</p>
                </div>
              </div>

              <ScrollArea className="h-64 rounded-xl border">
                <div className="p-4 space-y-2">
                  {importResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        result.success ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Row {result.row}: {result.name}
                        </p>
                        <p className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Button 
                onClick={() => setIsImportDialogOpen(false)} 
                className="w-full rounded-full"
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent/50 rounded-xl p-4">
                <p className="text-sm text-foreground font-medium mb-2">
                  Found {csvPreview.length} products to import
                </p>
                <p className="text-xs text-muted-foreground">
                  Use pipe (|) to separate multiple values for images, features, and care instructions.
                </p>
              </div>

              <ScrollArea className="h-64 rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Row</th>
                      <th className="text-left p-2 font-medium">Name</th>
                      <th className="text-left p-2 font-medium">Price</th>
                      <th className="text-left p-2 font-medium">Category</th>
                      <th className="text-left p-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, index) => {
                      const isUpdate = row.id && products.find(p => p.id === row.id);
                      return (
                        <tr key={index} className="border-t">
                          <td className="p-2 text-muted-foreground">{index + 2}</td>
                          <td className="p-2 font-medium">{row.name || '-'}</td>
                          <td className="p-2">₹{row.price || '0'}</td>
                          <td className="p-2">{row.category || 'wooden'}</td>
                          <td className="p-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isUpdate ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {isUpdate ? 'Update' : 'Create'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ScrollArea>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsImportDialogOpen(false)}
                  className="flex-1 rounded-full"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={processImport}
                  className="flex-1 rounded-full"
                  disabled={csvPreview.length === 0}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import {csvPreview.length} Products
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
