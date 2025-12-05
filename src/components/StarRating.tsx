import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({
  rating,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="inline-flex gap-1" onMouseLeave={() => !readonly && setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= displayRating;
        const isHovered = star <= hoverRating;

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            disabled={readonly}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer'} 
              transition-all duration-200 ease-out
              ${!readonly && 'hover:scale-125 active:scale-110'}
              focus:outline-none focus:ring-0
            `}
            style={{
              transitionDelay: readonly ? '0ms' : `${star * 30}ms`,
            }}
          >
            <svg
              className={`
                ${sizes[size]} 
                transition-all duration-200
                ${
                  isActive
                    ? isHovered
                      ? 'text-amber-400 drop-shadow-lg'
                      : 'text-amber-500'
                    : 'text-gray-300 hover:text-amber-200'
                }
              `}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}

      {/* Rating label - only show on larger sizes */}
      {size === 'lg' && !readonly && (
        <span className="ml-2 text-sm text-gray-500 self-center min-w-[4rem]">
          {displayRating === 0
            ? ''
            : displayRating === 1
              ? 'Not excited'
              : displayRating === 2
                ? 'A bit'
                : displayRating === 3
                  ? 'Interested'
                  : displayRating === 4
                    ? 'Excited!'
                    : '🔥 Dream job!'}
        </span>
      )}
    </div>
  );
}
