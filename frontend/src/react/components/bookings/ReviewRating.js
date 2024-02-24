import React, { useState } from 'react';
import emptyStar from '../../../layout/images/icon-paw-empty.png';
import filledStar from '../../../layout/images/icon-paw.png';

const ReviewRating = ({rating, setRating}) => {
  const [hover, setHover] = useState(null);

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
              height={25}
              width={25}
            />
          </label>
        );
      })}
    </div>
  );
};

export default ReviewRating;