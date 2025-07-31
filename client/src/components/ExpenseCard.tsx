import React, { useState } from 'react';
import { Expense, User, Category } from '../types';
import { formatCurrency, formatDate, formatDateTimeRelative } from '../utils/formatters';
import { Pencil, Store, MapPin, StickyNote, Paperclip, Eye, X, ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  user: User;
  category: Category;
  subcategoryName: string;
  onEdit: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  user,
  category,
  subcategoryName,
  onEdit
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasNotesOrAttachments = expense.notes || (expense.attachments && expense.attachments.length > 0);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center ${category.color}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate">{expense.description}</h3>
                <div className={`w-6 h-6 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}>
                  {user.avatar}
                </div>
              </div>
              <div className="text-sm text-slate-600 mb-2">
                {category.name} • {subcategoryName}
              </div>
              
              {/* Store Information */}
              {(expense.storeName || expense.storeLocation) && (
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                  {expense.storeName && (
                    <div className="flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span className="truncate">{expense.storeName}</span>
                    </div>
                  )}
                  {expense.storeLocation && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{expense.storeLocation}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes and Attachments Toggle Button */}
              {hasNotesOrAttachments && (
                <div className="mb-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {expense.notes && (
                        <div className="flex items-center gap-1">
                          <StickyNote className="w-3 h-3" />
                          <span>Notes</span>
                        </div>
                      )}
                      {expense.attachments && expense.attachments.length > 0 && (
                        <div className="flex items-center gap-1">
                          {expense.notes && <span>•</span>}
                          <Paperclip className="w-3 h-3" />
                          <span>{expense.attachments.length} file{expense.attachments.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    {showDetails ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}

              {/* Expandable Notes and Attachments Section */}
              {showDetails && hasNotesOrAttachments && (
                <div className="mb-2 space-y-2">
                  {/* Notes Preview */}
                  {expense.notes && (
                    <div className="p-2 bg-blue-50 rounded text-xs text-blue-800 border-l-2 border-blue-200">
                      <div className="whitespace-pre-wrap">{expense.notes}</div>
                    </div>
                  )}

                  {/* Attachments Preview */}
                  {expense.attachments && expense.attachments.length > 0 && (
                    <div>
                      <div className="flex gap-2 overflow-x-auto">
                        {expense.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex-shrink-0">
                            {attachment.type.startsWith('image/') ? (
                              <div className="relative group">
                                <img
                                  src={attachment.dataUrl}
                                  alt={attachment.name}
                                  className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setPreviewImage(attachment.dataUrl)}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-red-100 rounded flex items-center justify-center">
                                <Paperclip className="w-6 h-6 text-red-600" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* File names */}
                      <div className="mt-1 space-y-1">
                        {expense.attachments.map((attachment) => (
                          <div key={attachment.id} className="text-xs text-slate-600 truncate" title={attachment.name}>
                            📎 {attachment.name} ({formatFileSize(attachment.size)})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-xs text-slate-500">
                <div>{formatDate(expense.date)}</div>
                <div className="text-slate-400">Created {formatDateTimeRelative(expense.createdAt)}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">
                {formatCurrency(expense.amount)}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <button
                onClick={() => onEdit(expense)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Edit expense"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]">
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};