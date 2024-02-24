import editIcon from "../../../../layout/images/icon-edit.png";
import React from 'react';

/**
 * AboutMe Component
 *
 * This component is responsible for rendering the 'About Me' section in a user's profile.
 * It displays the user's personal description and provides an edit option if the 
 * viewer is the owner of the profile.
 *
 * Props:
 * - text: String containing the user's 'About Me' text.
 * - isProfileOwner: Boolean indicating whether the current user viewing the profile is its owner.
 * - onEdit: Function to handle the editing of the 'About Me' section.
 */
const AboutMe = ({ text, isProfileOwner, onEdit }) => {
  return (
    <div className="about-me-wrapper">
        <div className="heading-with-line">
          <h2>Über mich</h2>
          <div className="line"></div>
        </div>

      <div className="content-box">
        <div className="profile-text">
          <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
          <div className="edit-btn">
            {isProfileOwner && (
              <button onClick={onEdit}><img src={editIcon} alt="edit-icon" width={25} title="Bearbeiten"/></button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutMe;