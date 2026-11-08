import React from 'react';
import { Link } from 'react-router-dom';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-1.5 font-mono text-[11px] text-secondary uppercase tracking-wider mb-2">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-bold text-primary' : ''}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <span className="material-symbols-outlined text-xs text-outline">
                chevron_right
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

