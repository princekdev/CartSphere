import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="card p-3 animate-pulse">
      <div className="skeleton h-48 w-full mb-3 rounded" />
      <div className="skeleton h-4 w-3/4 mb-2 rounded" />
      <div className="skeleton h-4 w-1/2 mb-3 rounded" />
      <div className="skeleton h-8 w-full rounded" />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="skeleton h-96 rounded-lg" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-6 w-1/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-12 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="card p-4 animate-pulse mb-4">
      <div className="flex justify-between mb-3">
        <div className="skeleton h-5 w-1/3 rounded" />
        <div className="skeleton h-5 w-1/4 rounded" />
      </div>
      <div className="skeleton h-4 w-1/2 rounded mb-2" />
      <div className="skeleton h-4 w-1/3 rounded" />
    </div>
  );
}
