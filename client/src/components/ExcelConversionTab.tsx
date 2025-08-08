import React, { useState } from 'react';
import { FileSpreadsheet, Download, Upload, AlertCircle, CheckCircle, FileText, ArrowRight, Copy, Eye, X } from 'lucide-react';

export const ExcelConversionTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Sample Excel data structure
  const sampleExcelData = {
    users: [
      { id: '1', name: 'Alex Chen', username: 'alexc', email: 'alex.chen@example.com', avatar: 'AC', color: 'bg-emerald-500' },
      { id: '2', name: 'Sarah Johnson', username: 'sarahj', email: 'sarah.johnson@example.com', avatar: 'SJ', color: 'bg-blue-500' }
    ],
    categories: [
      { id: '1', name: 'Groceries', icon: 'ShoppingCart', color: 'text-green-600' },
      { id: '2', name: 'Utilities', icon: 'Zap', color: 'text-yellow-600' }
    ],
    subcategories: [
      { id: '1', name: 'Fresh Produce', categoryId: '1' },
      { id: '2', name: 'Electricity', categoryId: '2' }
    ],
    expenses: [
      {
        id: '1',
        userId: '1',
        categoryId: '1',
        subcategoryId: '1',
        amount: 89.45,
        description: 'Weekly grocery shopping',
        storeName: 'Whole Foods',
        storeLocation: 'Downtown',
        date: '2025-01-18',
        createdAt: '2025-01-18T10:30:00Z'
      }
    ]
  };

  const generateSampleJSON = () => {
    const sampleBackup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      users: sampleExcelData.users,
      categories: sampleExcelData.categories,
      subcategories: sampleExcelData.subcategories,
      expenses: sampleExcelData.expenses,
      credentials: {
        username: 'admin',
        password: 'pass123',
        email: 'admin@example.com',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue',
        useCase: 'personal-team'
      },
      settings: {
        fontSize: 'small',
        auth: 'false'
      },
      useCase: 'personal-team'
    };

    return JSON.stringify(sampleBackup, null, 2);
  };

  const downloadSampleExcel = () => {
    // Create CSV content that can be opened in Excel
    const csvContent = [
      // Users sheet data
      'USERS SHEET:',
      'ID,Name,Username,Email,Avatar,Color,Default Category ID,Default Subcategory ID,Default Store Location',
      '1,"Alex Chen",alexc,alex.chen@example.com,AC,bg-emerald-500,1,1,Downtown',
      '2,"Sarah Johnson",sarahj,sarah.johnson@example.com,SJ,bg-blue-500,2,2,Uptown',
      '',
      'CATEGORIES SHEET:',
      'ID,Name,Icon,Color',
      '1,Groceries,ShoppingCart,text-green-600',
      '2,Utilities,Zap,text-yellow-600',
      '3,Entertainment,Music,text-purple-600',
      '4,Transportation,Car,text-blue-600',
      '',
      'SUBCATEGORIES SHEET:',
      'ID,Name,Category ID',
      '1,"Fresh Produce",1',
      '2,"Meat & Dairy",1',
      '3,Electricity,2',
      '4,"Water & Sewer",2',
      '',
      'EXPENSES SHEET:',
      'ID,User ID,Category ID,Subcategory ID,Amount,Description,Store Name,Store Location,Date,Created At',
      '1,1,1,1,89.45,"Weekly grocery shopping","Whole Foods Market",Downtown,2025-01-18,2025-01-18T10:30:00Z',
      '2,1,2,3,125.50,"Monthly electricity bill","City Electric",,2025-01-15,2025-01-15T08:00:00Z',
      '3,2,1,2,67.32,"Lunch ingredients","Trader Joes",Uptown,2025-01-16,2025-01-16T15:30:00Z'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'expense-tracker-excel-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadSampleJSON = () => {
    const jsonContent = generateSampleJSON();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-expense-tracker-backup.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError('');
    setJsonOutput('');
    setIsProcessing(true);

    try {
      // For now, we'll provide instructions since we can't actually parse Excel files in the browser
      // In a real implementation, you'd use a library like xlsx or similar
      setError('Excel file parsing is not yet implemented. Please use the CSV template and convert manually, or export your Excel data as CSV and use the manual conversion guide below.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  };

  const downloadJSON = () => {
    if (!jsonOutput) return;
    
    const blob = new Blob([jsonOutput], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'converted-expense-backup.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Excel to JSON Converter</h3>
            <p className="text-slate-500">Convert Excel spreadsheets to JSON format for data restoration</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-bold">i</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">How it works</h4>
              <p className="text-blue-800 text-sm mt-1">
                This tool helps you convert Excel spreadsheets containing expense data into the JSON format 
                required by the backup/restore system. Download the sample files to see the expected structure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Files */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          Sample Files & Templates
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={downloadSampleExcel}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left w-full"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Excel Template (CSV)</div>
              <div className="text-sm text-slate-500">Download sample data structure for Excel</div>
            </div>
          </button>

          <button
            onClick={downloadSampleJSON}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left w-full"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Sample JSON Backup</div>
              <div className="text-sm text-slate-500">See the target JSON format for restoration</div>
            </div>
          </button>
        </div>
      </div>

      {/* Excel File Upload */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-orange-600" />
          Convert Excel File
        </h4>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              id="excel-upload"
            />
            <label
              htmlFor="excel-upload"
              className={`flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-400 transition-colors cursor-pointer text-center w-full ${
                isProcessing ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">
                  {isProcessing ? 'Processing...' : selectedFile ? selectedFile.name : 'Select Excel File'}
                </div>
                <div className="text-sm text-slate-500">
                  Supports .xlsx, .xls, and .csv files
                </div>
              </div>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Manual Conversion Guide */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Manual Conversion Guide
        </h4>

        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h5 className="font-medium text-purple-900 mb-2">Step-by-Step Process:</h5>
            <ol className="text-sm text-purple-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold mt-0.5">1</span>
                <span>Download the Excel template above to see the required sheet structure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold mt-0.5">2</span>
                <span>Organize your Excel data into separate sheets: Users, Categories, Subcategories, Expenses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold mt-0.5">3</span>
                <span>Export each sheet as CSV from Excel (File → Save As → CSV)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold mt-0.5">4</span>
                <span>Use an online CSV to JSON converter or manually format the data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold mt-0.5">5</span>
                <span>Combine all data into the backup JSON format (see sample JSON above)</span>
              </li>
            </ol>
          </div>

          {/* Required JSON Structure */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-slate-900">Required JSON Structure:</h5>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  {showPreview ? 'Hide' : 'Show'} Example
                </button>
                <button
                  onClick={() => copyToClipboard(generateSampleJSON())}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
            </div>
            
            {showPreview && (
              <div className="bg-white rounded border p-3 max-h-64 overflow-auto">
                <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                  {generateSampleJSON()}
                </pre>
              </div>
            )}
            
            <div className="text-sm text-slate-600 space-y-1 mt-3">
              <p><strong>Root level fields:</strong> version, timestamp, users, categories, subcategories, expenses, credentials, settings, useCase</p>
              <p><strong>Users:</strong> Array of user objects with id, name, username, email, avatar, color</p>
              <p><strong>Categories:</strong> Array of category objects with id, name, icon, color</p>
              <p><strong>Subcategories:</strong> Array of subcategory objects with id, name, categoryId</p>
              <p><strong>Expenses:</strong> Array of expense objects with all expense fields</p>
            </div>
          </div>

          {/* Online Tools Recommendations */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h5 className="font-medium text-amber-900 mb-2">Recommended Online Tools:</h5>
            <div className="text-sm text-amber-800 space-y-1">
              <p>• <strong>CSV to JSON:</strong> csvjson.com, convertcsv.com</p>
              <p>• <strong>Excel to CSV:</strong> Use Excel's built-in "Save As" → CSV function</p>
              <p>• <strong>JSON Formatter:</strong> jsonformatter.org (to validate your JSON)</p>
              <p>• <strong>Text Editor:</strong> VS Code, Notepad++, or any text editor for manual editing</p>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Output */}
      {jsonOutput && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Converted JSON Output
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(jsonOutput)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={downloadJSON}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-auto">
            <pre className="text-xs text-slate-600 whitespace-pre-wrap">
              {jsonOutput}
            </pre>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                JSON is ready! You can now use this file in the Backup & Restore tab to restore your data.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Quick Reference
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h5 className="font-medium text-slate-800">Excel Sheet Names:</h5>
            <div className="text-sm text-slate-600 space-y-1">
              <div>• <strong>Users:</strong> User information and defaults</div>
              <div>• <strong>Categories:</strong> Main expense categories</div>
              <div>• <strong>Subcategories:</strong> Subcategories linked to categories</div>
              <div>• <strong>Expenses:</strong> Individual expense records</div>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium text-slate-800">Important Notes:</h5>
            <div className="text-sm text-slate-600 space-y-1">
              <div>• IDs must be unique within each sheet</div>
              <div>• Dates should be in YYYY-MM-DD format</div>
              <div>• Colors use Tailwind CSS classes</div>
              <div>• Icons use Lucide React icon names</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};