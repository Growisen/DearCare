import React from 'react';

export default function NurseCardsSkeleton() {
  return (
    <div className="w-full bg-white border border-slate-200 rounded p-4 animate-pulse h-full">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 bg-slate-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-4 bg-slate-200 rounded" />
          </div>
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-3 w-40 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="mt-4 h-24 bg-slate-50 border border-slate-100 rounded" />
    </div>
  );
}