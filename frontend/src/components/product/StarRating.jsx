import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating = 0, onRate, size = 20 }) {
  const [hover, setHover] = useState(0);
  const active = hover || rating;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => onRate && setHover(star)}
          onMouseLeave={() => onRate && setHover(0)}
          className={`transition-colors ${onRate ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <FiStar
            size={size}
            className={star <= active ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}
