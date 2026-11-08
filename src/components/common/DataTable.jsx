import React, { useState } from 'react';

export const DataTable = ({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No complaints found matching current filters',
  pageSize = 5
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-3.5 font-semibold ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${idx === 0 ? 'rounded-l-lg' : ''} ${idx === columns.length - 1 ? 'rounded-r-lg' : ''}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body text-body-sm">
            {currentData.length > 0 ? (
              currentData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-surface-container-low/70 transition-colors group ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${row.status === 'OVERDUE' ? 'bg-error-container/10' : ''}`}
                  style={{ minHeight: '52px' }}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-3 px-3.5 align-middle ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-secondary font-body">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.length > 0 && (
        <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm text-secondary font-body text-label-sm border-t border-outline-variant/20 mt-4">
          <span>
            Showing <strong className="text-on-surface">{data.length === 0 ? 0 : startIndex + 1}</strong> to{' '}
            <strong className="text-on-surface">{Math.min(startIndex + pageSize, data.length)}</strong> of{' '}
            <strong className="text-on-surface">{data.length}</strong> entries
          </span>

          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center disabled:opacity-40 transition-colors"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-label-sm font-semibold flex items-center justify-center transition-colors ${
                  currentPage === page
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center disabled:opacity-40 transition-colors"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

