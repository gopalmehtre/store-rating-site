import React, { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readOnly = false, size = 'md' }) => {
  const [hover, setHover] = useState(0);
  const fontSize = size === 'sm' ? '16px' : size === 'lg' ? '28px' : '22px';

  return (
    <div className="star-rating" style={{ gap: size === 'sm' ? '2px' : '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? 'filled' : ''}`}
          style={{ fontSize, cursor: readOnly ? 'default' : 'pointer' }}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
