import React from 'react';

export const Logo = ({ mode = 'full', className = '', iconClassName = '', textClassName = '', fillColor }) => {
  const logoIcon = (
    <svg
      viewBox="0 0 178 254"
      className={`w-full h-full fill-current ${iconClassName}`}
      aria-label="LifeSave Logo Icon"
      style={{ display: 'inline-block' }}
    >
      <defs>
        <linearGradient id="lifeSaveBloodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C51B24" />
          <stop offset="100%" stopColor="#800A10" />
        </linearGradient>
      </defs>
      <path
        d="M 91 2 L 96 16 L 109 40 L 152 100 L 169 130 L 176 152 L 178 178 L 175 194 L 169 209 L 158 225 L 145 236 L 159 217 L 168 192 L 169 165 L 166 151 L 153 123 L 110 60 L 89 17 L 82 35 L 68 63 L 34 119 L 29 137 L 30 151 L 36 166 L 51 182 L 65 190 L 87 199 L 95 204 L 105 214 L 106 217 L 104 220 L 97 221 L 83 215 L 68 212 L 63 215 L 68 220 L 80 227 L 94 230 L 111 228 L 129 221 L 135 221 L 138 224 L 128 235 L 108 248 L 92 253 L 73 254 L 57 251 L 46 247 L 31 238 L 20 228 L 11 216 L 3 199 L 0 186 L 0 159 L 5 139 L 15 117 L 65 47 L 77 27 L 89 0 L 91 2 Z"
        fill={fillColor || "url(#lifeSaveBloodGrad)"}
      />
    </svg>
  );

  if (mode === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {logoIcon}
      </div>
    );
  }

  if (mode === 'navbar') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="flex h-9 w-9 items-center justify-center shrink-0">
          {logoIcon}
        </div>
        <span className={`text-xl font-bold tracking-tight text-slate-900 dark:text-white font-serif select-none ${textClassName}`}>
          Life<span className="text-primary-600 dark:text-primary-600 font-semibold">Save</span>
        </span>
      </div>
    );
  }

  // default mode === 'full'
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Icon */}
      <div className="w-20 h-28 mb-3">
        {logoIcon}
      </div>
      
      {/* Title */}
      <h1 className={`text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-serif select-none ${textClassName}`}>
        Life<span className="text-primary-600 dark:text-primary-600 font-semibold">Save</span>
      </h1>
      
      {/* Tagline */}
      <div className="flex items-center justify-center gap-2 mt-3 w-full">
        <div className="h-[1px] w-8 bg-slate-350 dark:bg-slate-700"></div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-450 dark:text-slate-500 select-none">
          Donate Blood. Save Lives.
        </span>
        <div className="h-[1px] w-8 bg-slate-350 dark:bg-slate-700"></div>
      </div>
    </div>
  );
};
