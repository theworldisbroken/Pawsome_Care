import React from 'react';
import cat from "../../../../layout/images/katze.png";
import editIcon from "../../../../layout/images/icon-edit.png";
import deleteIcon from "../../../../layout/images/icon-trashcan.png";
import { formatLastLoggedIn, renderStars } from "../../utils/formatLastLoggedIn"
import ReviewRating from './ReviewRating';
import { Link } from 'react-router-dom';
import profilePictureDummy from '../../../../layout/images/ProfilePictureDummy.png'

/**
 * ReviewItem Component
 *
 * This component displays individual reviews or posts on a user's profile. It handles the rendering
 * of reviews with ratings and comments, as well as user posts with or without replies. The component
 * provides options for the profile owner and the post creator to edit or delete the reviews/posts, 
 * and for the profile owner to reply to posts.
 *
 * Props:
 * - review: The review or post object containing details like text, creator, rating, reply, etc.
 * - onEdit: Function to handle editing of the review or post.
 * - onReply: Function to handle replying to a post.
 * - onDelete: Function to handle deletion of the review or post.
 * - onEditReply: Function to handle editing a reply.
 * - onDeleteReply: Function to handle deletion of a reply.
 * - userID: The unique identifier of the current user (viewer).
 * - isProfileOwner: Boolean indicating whether the current user is the owner of the profile.
 */
function ReviewItem({ review, onEdit, onReply, onDelete, onEditReply, onDeleteReply, userID, isProfileOwner }) {
  const { creator, text, booking, rating, reply } = review;
  const isReview = booking !== null;
  const isPostCreator = userID === review.creator._id;

  return (

    <div>
      {!isReview ? (
        <div className="pin-wrapper">
          <Link to={`/profil/${creator.userID}`} className='profile-username-container'>
            <img
              alt='profile pic'
              height={80}
              width={80}
              style={{ objectFit: "cover" }}
              src={creator.profilePicture
                ? `${process.env.REACT_APP_SERVER}/pictures/${creator.profilePicture}`
                : profilePictureDummy}
              className="mini-profile-image"
            />
            <p>@{creator.userID}</p>
          </Link>
          <div className='speech-bubble-container'>

            <div className='speech-bubble'>
              <div className='speech-bubble-content2'>
                <div>
                  <p><strong>{creator.firstName}</strong></p>
                  {
                    review.createdAt !== review.updatedAt ? (
                      <p style={{ fontSize: '0.8rem', color: '#afafaf' }}>
                        * {formatLastLoggedIn(review.updatedAt)}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: '#afafaf' }}>
                        {formatLastLoggedIn(review.createdAt)}
                      </p>
                    )
                  }
                </div>

                <p>{text}</p>

              </div>
              {reply &&
                <div className='reply-item'>
                  <div>
                    <p style={{ fontSize: '0.8rem' }}>Antwort:</p>
                    {
                      reply.createdAt !== reply.updatedAt ? (
                        <p style={{ fontSize: '0.8rem' }}>
                          * {formatLastLoggedIn(reply.updatedAt)}
                        </p>
                      ) : (
                        <p style={{ fontSize: '0.8rem' }}>
                          {formatLastLoggedIn(reply.createdAt)}
                        </p>
                      )
                    }
                  </div>
                  {reply ? reply.text : ""}
                </div>
              }
            </div>

            <div className='review-options'>
              <>
                {!review.reply && isProfileOwner && (
                  <div>
                    <button className="text-btn" onClick={() => onReply(review)}>Antworten</button>
                  </div>
                )}
                {!review.reply && isProfileOwner && (
                  <div>
                    <button className="text-btn" onClick={() => onDelete(review._id)}>Löschen</button>
                  </div>
                )}
                {review.reply && isProfileOwner && (
                  <div>
                    <button className="text-btn" onClick={() => onEditReply(review)}>Bearbeiten</button>
                  </div>
                )}
                {review.reply && isProfileOwner && (
                  <div>
                    <button className="text-btn" onClick={() => onDeleteReply(review._id)}>Löschen</button>
                  </div>
                )}
                {isPostCreator && (
                  <div>
                    <button className="text-btn" onClick={() => onEdit(review)}>Bearbeiten</button>
                  </div>
                )}
                {isPostCreator && (
                  <div>
                    <button className="text-btn" onClick={() => onDelete(review._id)}>Löschen</button>
                  </div>
                )}
              </>
            </div>
          </div>
        </div >
      ) : (
        <div className='review-wrapper'>
          <div className='content-box'>
            <Link to={`/profil/${creator.userID}`} className='profile-username-container'>
              <img
                alt='profile pic'
                height={80}
                width={80}
                style={{ objectFit: "cover" }}
                src={creator.profilePicture
                  ? `${process.env.REACT_APP_SERVER}/pictures/${creator.profilePicture}`
                  : profilePictureDummy}
                className="mini-profile-image"
              />
              <p>@{creator.userID}</p>
            </Link>
            <div className='speech-bubble-container'>

              <div>
                <div className='speech-bubble-content'>
                  <div>
                    <p><strong>{creator.firstName}</strong></p>
                    <span>{renderStars(rating)}</span>
                  </div>
                  <div>
                    {
                      review.createdAt !== review.updatedAt ? (
                        <p style={{ fontSize: '0.8rem', color: '#afafaf' }}>
                          * {formatLastLoggedIn(review.updatedAt)}
                        </p>
                      ) : (
                        <p style={{ fontSize: '0.8rem', color: '#afafaf' }}>
                          {formatLastLoggedIn(review.createdAt)}
                        </p>
                      )
                    }
                  </div>
                </div>
                <p>{text}</p>
              </div>
              {reply &&
                <div className='reply-item'>
                  <div>
                    <p style={{ fontSize: '0.8rem' }}>Antwort:</p>
                    {
                      reply.createdAt !== reply.updatedAt ? (
                        <p style={{ fontSize: '0.8rem' }}>
                          * {formatLastLoggedIn(reply.updatedAt)}
                        </p>
                      ) : (
                        <p style={{ fontSize: '0.8rem' }}>
                          {formatLastLoggedIn(reply.createdAt)}
                        </p>
                      )
                    }
                  </div>
                  {reply ? reply.text : ""}
                </div>
              }
            </div>
          </div>
          <div className='review-options'>
            <>
              {!review.reply && isProfileOwner && (
                <div>
                  <button className="text-btn" onClick={() => onReply(review)}>Antworten</button>
                </div>
              )}
              {review.reply && isProfileOwner && (
                <div>
                  <button className="text-btn" onClick={() => onEditReply(review)}>Bearbeiten</button>
                </div>
              )}
              {review.reply && isProfileOwner && (
                <div>
                  <button className="text-btn" onClick={() => onDeleteReply(review._id)}>Löschen</button>
                </div>
              )}
              {isPostCreator && (
                <div>
                  <button className="text-btn" onClick={() => onEdit(review)}>Bearbeiten</button>
                </div>
              )}
              {isPostCreator && (
                <div>
                  <button className="text-btn" onClick={() => onDelete(review._id)}>Löschen</button>
                </div>
              )}
            </>
          </div>


        </div>
      )
      }


    </div >
  );
}

export default ReviewItem;