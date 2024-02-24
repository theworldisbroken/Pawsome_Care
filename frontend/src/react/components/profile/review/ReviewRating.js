import React, { useState } from 'react';
import emptyStar from '../../../../layout/images/icon-paw-empty.png';
import filledStar from '../../../../layout/images/icon-paw.png';

const ReviewRating = () => {
  const [hover, setHover] = useState(null);
  const [rating, setRating] = useState(0);

  return (
    <div>
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;

        return (
          <label key={index} onMouseLeave={() => setHover(null)}>
            <input
              type="radio"
              name="rating"
              style={{ display: "none" }}
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
            />
            <img
              src={hover >= ratingValue || rating >= ratingValue ? filledStar : emptyStar}
              onMouseEnter={() => setHover(ratingValue)}
              alt={`${ratingValue} Sterne`}
              style={{ cursor: 'pointer' }}
            />
          </label>
        );
      })}
    </div>
  );
};

export default ReviewRating;