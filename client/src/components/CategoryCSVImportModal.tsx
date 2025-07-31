import React, { useState } from 'react';
import { Category } from '../types';
import { parseCSVContent, validateImportData, generateCategoryTemplate, downloadCSV } from '../utils/categoryCsvUtils';
import { X, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';

interface CategoryCSVImportModalProps {
  onImport: (categories: Category[]) => void;
  onClose: () => void;
}

export const CategoryCSVImportModal: React.FC<CategoryCSVImportModalProps> = ({
  onImport,
  onClose
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [validationResult, setValidationResult] = useState<{
    validCategories: Category[];
    errors: string[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'validate' | 'confirm'>('upload');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      setStep('validate');
    };
    reader.readAsText(file);
  };

  const handleTextareaChange = (content: string) => {
    setCsvContent(content);
    if (content.trim()) {
      setStep('validate');
    } else {
      setStep('upload');
      setValidationResult(null);
    }
  };

  const validateCSV = async () => {
    if (!csvContent.trim()) return;

    setIsProcessing(true);
    try {
      const csvCategories = parseCSVContent(csvContent);
      const result = validateImportData(csvCategories);
      setValidationResult(result);
      setStep('confirm');
    } catch (error) {
      alert(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (validationResult?.validCategories) {
      onImport(validationResult.validCategories);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const template = generateCategoryTemplate();
    downloadCSV(template, 'category_import_template.csv');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900">Import Categories from CSV</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'upload' ? 'bg-emerald-600 text-white' : 
                step === 'validate' || step === 'confirm' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                1
              </div>
              <div className={`w-12 h-0.5 ${step === 'validate' || step === 'confirm' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'validate' ? 'bg-emerald-600 text-white' : 
                step === 'confirm' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                2
              </div>
              <div className={`w-12 h-0.5 ${step === 'confirm' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 'confirm' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                3
              </div>
            </div>
          </div>

          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload CSV File</h3>
                <p className="text-slate-500">Choose a CSV file or paste CSV data to import categories and subcategories</p>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-slate-600 font-medium">Drop your CSV file here or click to browse</p>
                  <p className="text-sm text-slate-500">Supports .csv files up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="text-center text-slate-500">
                <span>or</span>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Paste CSV Data</label>
                <textarea
                  value={csvContent}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  placeholder="Paste your CSV data here..."
                />
              </div>

              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Need a template?</h4>
                    <p className="text-sm text-blue-700 mb-3">Download our CSV template to see the required format and column headers.</p>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Required Format Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2">Required CSV Format:</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>• First row must contain column headers</p>
                  <p>• Required columns: Category ID, Category Name, Category Icon, Category Color</p>
                  <p>• Optional columns: Subcategory ID, Subcategory Name</p>
                  <p>• Multiple rows with same Category ID will be grouped together</p>
                  <p>• Each row with a Subcategory ID creates a subcategory under that category</p>
                  <p>• Icon must be a valid Lucide React icon name</p>
                  <p>• Color must be a valid Tailwind text color class (e.g., text-blue-600)</p>
                </div>
              </div>
            </div>
          )}

          {step === 'validate' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Validate Data</h3>
                <p className="text-slate-500">Review your CSV data before importing</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2">CSV Preview:</h4>
                <div className="bg-white rounded border p-3 max-h-32 overflow-auto">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                    {csvContent.split('\n').slice(0, 5).join('\n')}
                    {csvContent.split('\n').length > 5 && '\n...'}
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Back to Upload
                </button>
                <button
                  onClick={validateCSV}
                  disabled={isProcessing || !csvContent.trim()}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Validating...' : 'Validate Data'}
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && validationResult && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Import Summary</h3>
                <p className="text-slate-500">Review the validation results before importing</p>
              </div>

              {/* Success Summary */}
              {validationResult.validCategories.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">
                        {validationResult.validCategories.length} categories ready to import
                      </h4>
                      <p className="text-sm text-green-700">
                        Total subcategories: {validationResult.validCategories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Summary */}
              {validationResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 mb-2">
                        {validationResult.errors.length} errors found
                      </h4>
                      <div className="max-h-32 overflow-y-auto">
                        {validationResult.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700 mb-1">• {error}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Preview */}
              {validationResult.validCategories.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-3">Preview of categories to import:</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {validationResult.validCategories.map((category, index) => (
                      <div key={index} className="bg-white rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded ${category.color.replace('text-', 'bg-').replace('-600', '-100')} flex items-center justify-center`}>
                            <span className={`text-xs ${category.color}`}>●</span>
                          </div>
                          <span className="font-medium text-slate-900">{category.name}</span>
                          <span className="text-xs text-slate-500">({category.icon})</span>
                        </div>
                        {category.subcategories.length > 0 && (
                          <div className="ml-8 space-y-1">
                            {category.subcategories.map((sub, subIndex) => (
                              <div key={subIndex} className="text-sm text-slate-600">
                                • {sub.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Important Notes:</h4>
                    <ul className="text-sm text-amber-800 mt-1 space-y-1">
                      <li>• This will replace your existing categories and subcategories</li>
                      <li>• Any expenses linked to deleted categories will be removed</li>
                      <li>• Make sure to export your current categories first if you want to keep them</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('validate')}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Back to Validate
                </button>
                <button
                  onClick={handleImport}
                  disabled={validationResult.validCategories.length === 0}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {validationResult.validCategories.length} Categories
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};