import React, { useState, useEffect } from 'react';
import ReviewItem from './ReviewItem';
import ReviewModal from "./ReviewModal"
import emptyPinboard from "../../../../layout/images/empty-pinboard.png";


/**
 * Reviews Component
 *
 * This component is responsible for displaying and managing reviews on a user's profile page. 
 * It allows users to view, create, edit, and delete reviews and replies.
 *
 * Props:
 * - profileID: The unique identifier of the user profile whose reviews are being displayed.
 * - profileData: Object containing the user's profile information.
 * - accessToken: Token for authenticated API requests.
 * - userID: The unique identifier of the current user (viewer).
 * - isProfileOwner: Boolean indicating whether the current user is the owner of the profile.
 */
function Reviews({ profileID, accessToken, userID, isProfileOwner, showToast }) {
  // State to manage reviews and modal for creating/editing reviews
  const [reviews, setReviews] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null,
    currentText: '',
    parentText: '',
    currentPostId: null
  });

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, [profileID]);

  // Function to fetch reviews from API
  const fetchReviews = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + `/review/${profileID}`);
      if (response.ok) {
        let data = await response.json();

        // Sort reviews by most recently created
        data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setReviews(data);
      }
      else {
        console.error('Fehler beim Abrufen der Reviews');
        setReviews([]);

      };
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  }

  // Function to handle saving of a review or reply
  const handleSave = async (text, id) => {
    if (modalState.action === 'createPost') {
      await handleCreatePost(text);
    }
    else if (modalState.action === 'updatePost') {
      await handleUpdatePost(id, text);
    }
    else if (modalState.action === 'createReply') {
      await handleReply(id, text, false);
    }
    else if (modalState.action === 'updateReply') {
      await handleReply(id, text, true);
    }
    setModalState({ ...modalState, isOpen: false });
  };

  // Functions to open modals for creating/editing posts and replies
  const openNewPostModal = () => {
    setModalState({
      isOpen: true,
      action: 'createPost',
      currentText: '',
      parentText: '',
      currentPostID: null
    })
  };
  const openEditPostModal = (review) => {
    setModalState({
      isOpen: true,
      action: 'updatePost',
      currentText: review.text,
      parentText: '',
      currentPostID: review._id
    })
  };
  const openNewReplyModal = (review) => {
    setModalState({
      isOpen: true,
      action: 'createReply',
      currentText: '',
      parentText: review.text,
      currentPostID: review._id
    })
  };
  const openEditReplyModal = (review) => {
    setModalState({
      isOpen: true,
      action: 'updateReply',
      currentText: review.reply.text,
      parentText: review.text,
      currentPostID: review._id
    })
  };

  // Function to create a new post
  const handleCreatePost = async (text) => {
    const data = {
      creator: userID,
      receiver: profileID,
      text: text
    }
    const response = await fetch(process.env.REACT_APP_SERVER + `/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      fetchReviews();
      showToast('Beitrag erstellt');
    } else {
      showToast('Ein Fehler ist aufgetreten');
    }
  };

  // Function to update an existing post
  const handleUpdatePost = async (id, text) => {
    const data = {
      creator: userID,
      receiver: profileID,
      text: text
    }
    const response = await fetch(process.env.REACT_APP_SERVER + `/review/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      fetchReviews();
      showToast('Beitrag bearbeitet');
    } else {
      showToast('Ein Fehler ist aufgetreten');
    }
  };

  // Function to handle deletion of a post or a reply
  const handleDelete = async (id) => {
    if (!window.confirm("Sind Sie sicher, dass Sie diesen Beitrag löschen möchten?")) {
      return;
    }

    try {
      const response = await fetch(process.env.REACT_APP_SERVER+ `/review/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        fetchReviews();
        showToast('Beitrag gelöscht');
      } else {
        showToast('Ein Fehler ist aufgetreten');
      }
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  };

  // Function to create or update a reply
  const handleReply = async (id, text, update) => {
    if (!text && !window.confirm("Sind Sie sicher, dass Sie diese Antwort löschen möchten?")) return;
    const data = {
      creator: userID,
      text: text
    }
    const response = await fetch(process.env.REACT_APP_SERVER + `/review/reply/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      fetchReviews();
      if (!text) {
        showToast('Antwort gelöscht');
      }
      else if (update){
        showToast('Antwort bearbeitet');
      }
      else{
        showToast('Antwort erstellt');
      }
    } else {
      showToast('Ein Fehler ist aufgetreten');
    }
  };

  return (
    <div className="pinboard-wrapper">

      <div className="heading-with-line">
        <h2>Meine Pinnwand</h2>
        <div className="line"></div>
        {!isProfileOwner && accessToken && (
          <button className="create-btn" onClick={openNewPostModal}>+</button>
        )}
      </div>
      {modalState.isOpen && <ReviewModal
        id={modalState.currentPostID}
        onSave={handleSave}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        initialText={modalState.currentText}
        parentText={modalState.parentText}
      />}
      <div className="reviews-container">

        {reviews.length === 0 ? (
          <div className="no-reviews">
            <div className='no-content-img'>
              <img src={emptyPinboard} alt="Keine Bewertungen gefunden" height={150} />
              <p>Noch keine Beiträge</p>
            </div>
          </div>

        ) : (

          reviews.map(review => (
            <ReviewItem key={review._id}
              review={review}
              onEdit={openEditPostModal}
              onReply={openNewReplyModal}
              onDelete={handleDelete}
              onEditReply={openEditReplyModal}
              onDeleteReply={handleReply}
              userID={userID}
              isProfileOwner={isProfileOwner} />
          ))
        )}
      </div>
    </div>

  );
}

export default Reviews;