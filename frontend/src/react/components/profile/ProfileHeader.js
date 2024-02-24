import React, { useState, useEffect } from 'react';
import cat from "../../../layout/images/katze.png";
import contactIcon from "../../../layout/images/icon-contact.png";
import heartIcon from "../../../layout/images/icon-heart.png";
import redheartIcon from "../../../layout/images/icon-redheart.png";
import timeIcon from "../../../layout/images/icon-time.png";
import locationIcon from "../../../layout/images/icon-location.png";
import succ from "../../../layout/images/icon-verified.png";
import fail from "../../../layout/images/icon-fail.png";
import settingsIcon from "../../../layout/images/icon-cog.png";
import { Link } from "react-router-dom";
import { formatLastLoggedIn, renderStars } from "../utils/formatLastLoggedIn"
import profilePictureDummy from '../../../layout/images/ProfilePictureDummy.png'

/**
 * ProfileHeader Component
 * 
 * This component renders the header section of a user's profile page. It displays key information
 * about the user such as their profile picture, username, name, availability status, and ratings.
 * 
 * Props:
 * - profileData: Object containing user's profile information including ratings and user details.
 * - isProfileOwner: Boolean indicating whether the current user viewing the profile is its owner.
 * - toggleFav: Function to toggle the 'favorite' status of the profile for the current user.
 * - isFav: Boolean indicating whether the current user has favorited this profile.
 */
const ProfileHeader = ({ profileData, isProfileOwner, toggleFav, isFav, daysWithActiveSlots, daysWithOnlyBookedSlots }) => {

  const { user, ratingCount, ratingAverage } = profileData
  const [lastLoggedIn, setLastLoggedIn] = useState("");

  useEffect(() => {
    if (profileData && user.last_logged_in) setLastLoggedIn(formatLastLoggedIn(user.last_logged_in));
  }, [profileData]);

  const active = daysWithActiveSlots.length >= 1;
  const booked = !active && daysWithOnlyBookedSlots.length >= 1;

  return (

    <div className="profile-header-wrapper">

      <div className="profile-header-left">
        <img
          alt='profile pic'
          height={200}
          width={200}
          style={{ objectFit: "cover" }}
          src={user.profilePicture
            ? `${process.env.REACT_APP_SERVER}/pictures/${user.profilePicture}`
            : profilePictureDummy}
        />
        <p>@{user.userID}</p>
      </div>

      <div className="profile-header-right">

        <div className='name-and-status'>
          <h2>{user.firstName ? user.firstName : user.userID}</h2>
          { }
          {active && <p> VERFÜGBAR</p>}
          {booked && <p> AUSGEBUCHT</p>}
        </div>

        <div className='ratings'>
          <p>{renderStars(ratingAverage)} </p>
          <p>({ratingCount} Bewertungen )</p>
        </div>

        <div className='about-me-container'>
          <div>
            <div>
              <label>Über mich:</label>
            </div>
            <div>
              <img src={locationIcon} alt="Standort-Icon" width={20} />
              <p>{profileData.location.address ? profileData.location.address : 'Keine Angabe'}</p>
            </div>
            <div>
              <img src={timeIcon} alt="Zuletzt-Online-Icon" width={20} />
              <p>Zuletzt aktiv: {lastLoggedIn} </p>
            </div>
            <div>
              <img src={heartIcon} alt="Favorisieren" width={20} />
              <p>{profileData.favoritedBy.length} mal favorisiert</p>
            </div>
          </div>

          <div>
            <div>
              <label>Verifizierte Informationen:</label>
            </div>
            <div className={user.isVerified ? '' : 'not-verified'}>
              {user.isVerified ?
                (<img src={succ} alt="Success-Icon" width={20} />) :
                (<img src={fail} alt="Failed-Icon" width={20} />)
              }
              <p>E-Mail</p>
            </div>
            <div className={user.successQuiz ? '' : 'not-verified'}>
              {user.successQuiz ?
                (<img src={succ} alt="Success-Icon" width={20} />) :
                (<img src={fail} alt="Failed-Icon" width={20} />)
              }
              <p>Tiersitterquiz</p>
            </div>
          </div>
        </div>

      </div>

      <div className="profile-actions">
        {isProfileOwner ? (
          <button className='setting-btn'>
            <Link to="/settings">
              <img src={settingsIcon} alt="settings-icon" width={30} />
            </Link>

          </button>
        ) : (
          <>
            <button className='contact-btn'>
              <img src={contactIcon} alt="contact-icon" width={30} />
            </button>
            <button className='like-btn' onClick={toggleFav}>
              <img src={isFav ? redheartIcon : heartIcon} alt="heart-icon" width={30} />
            </button>
          </>
        )}
      </div>

    </div>

  )
}

export default ProfileHeader;