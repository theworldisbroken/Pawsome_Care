import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import AboutMe from './main/AboutMe';
import ProfileHeader from './ProfileHeader';
import Services from './main/Services'
import Availability from './main/Availability';
import Reviews from './review/Reviews';
import PetPass from './petpass/PetPass';
import Gallery from './gallery/Gallery';
import RequestBooking from './requestBooking/RequestBooking';
import Booking from './setAvailability/Booking';
import { connect } from "react-redux"
import * as authenticationService from "../authentication/state/AuthenticationService";
import { bindActionCreators } from "redux";
import AboutMeModal from './main/AboutMeModal';
import ServicesModal from './main/ServicesModal';
import "../../../layout/style/userProfile.css"
import "../../../layout/style/actionbuttons.css"
import "../../../layout/style/modal.css"
import "../../../layout/style/profileStructure.css"
import "../../../layout/style/components.css"
import "../../../layout/style/petpass.css"
import "../../../layout/style/pinboard.css"
import "../../../layout/style/requestBooking.css"
import "../../../layout/style/findBookings.css"
import Location from './main/Location';
import GoogleMapsWrapper from '../../GoogleMapsWrapper';
import LocationModal from './main/LocationModal';
import { format } from 'date-fns';
import emptyPinboard from "../../../layout/images/empty-pinboard.png";

import "../../../layout/style/gallery.css"
import "../../../layout/style/toast.css"

/**
 * Profile Component
 *
 * This component is responsible for rendering and managing a user's profile page in the application.
 * It handles various functionalities including fetching and displaying user profile data, 
 * editing user information, managing services offered by the user, and handling user reviews 
 * and booking requests.
 */
const Profile = (props) => {
  // Extract the user ID from the URL parameters
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();

  // Destructuring properties from props
  const { cookieCheck, user_mongoID, accessToken } = props;

  // State for storing profile ID, profile data, active tab, modals' visibility, favorite status, etc.
  const [profileID, setProfileID] = useState(null)
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState();
  const [aboutMeModal, setAboutMeModal] = useState(false);
  const [servicesModal, setServicesModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [aboutMeText, setAboutMeText] = useState("");
  const [services, setServices] = useState({
    dog: false,
    cat: false,
    serviceList: {
      hausbesuch: { offered: false, price: 0 },
      gassi: { offered: false, price: 0 },
      training: { offered: false, price: 0 },
      herberge: { offered: false, price: 0 },
      tierarzt: { offered: false, price: 0 },
    }
  });
  const [location, setLocation] = useState(null)
  const [petPasses, setPetPasses] = useState([]);


  // State to store days with active and booked slots
  const [daysWithActiveSlots, setDaysWithActiveSlots] = useState([]);
  const [daysWithOnlyBookedSlots, setDaysWithOnlyBookedSlots] = useState([]);

  const [saveMessage, setSaveMessage] = useState(null);

  const isProfileOwner = user_mongoID === profileID;

  const [tutorialSeen, setTutorialSeen] = useState(
    localStorage.getItem('tutorialSeen') === 'true'
  );

  const closeTutorial = () => {
    localStorage.setItem('tutorialSeen', 'true');
    setTutorialSeen(true);
  }

  useEffect(() => {
    if (!localStorage.getItem('tutorialSeen')) {
      localStorage.setItem('tutorialSeen', 'false');
    }
  }, []);

  // Fetching the user cookie and profile information when the component mounts or when certain dependencies change
  useEffect(() => {
    cookieCheck()
  }, [cookieCheck]);

  useEffect(() => {
    if (id) {
      fetchUserId();
    }
  }, [id]);

  useEffect(() => {
    if (profileID) {
      fetchProfileData();
      fetchBookedDays();
      fetchPetPasses();
    }
  }, [profileID]);

  useEffect(() => {
    const pathSegments = loc.pathname.split('/');
    const tabName = pathSegments[3];
    if (tabName === 'pinnwand') {
      setActiveTab("reviews");
    }
    else if (tabName === 'haustierpaesse') {
      setActiveTab("passes");
    }
    else if (tabName === 'galerie') {
      setActiveTab("gallery");
    }
    else if (tabName === 'termin') {
      setActiveTab("book");
    }
    else {
      setActiveTab('pawsome');
    }
  }, [loc]);


  console.log(activeTab)

  const fetchUserId = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + `/users/user/${id}`)
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data = await response.json();
      setProfileID(data.id);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch the profile data based on the profile ID
  const fetchProfileData = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + `/profile/${profileID}`);
      if (!response.ok) throw new Error('Profile fetch failed');
      const data = await response.json();
      setProfileData(data);
      setIsFavorited(data.favoritedBy.includes(user_mongoID));
    } catch (error) {
      console.error(error);
    }
  };

  // Function to fetch booked days based on the profile ID
  const fetchBookedDays = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + `/slot?creator=${profileID}`);
      if (response.ok) {
        const bookings = await response.json();
        const activeDaysSet = new Set();
        const allBookedDaysSet = new Set();

        // Parsing and storing the dates from the bookings
        bookings.forEach(booking => {
          const dateOnly = format(new Date(booking.date), 'yyyy-MM-dd');
          allBookedDaysSet.add(dateOnly);
          if (booking.status === 'active') {
            activeDaysSet.add(dateOnly);
          }
        });

        // Filtering only booked days (excluding active)
        const onlyBookedDaysSet = new Set([...allBookedDaysSet].filter(day => !activeDaysSet.has(day)));

        // Updating state with the parsed dates
        setDaysWithActiveSlots(Array.from(activeDaysSet).map(day => new Date(day)));
        setDaysWithOnlyBookedSlots(Array.from(onlyBookedDaysSet).map(day => new Date(day)));
      } else {
        console.error('Fehler beim Abrufen der Buchungen');
        setDaysWithActiveSlots([]);
        setDaysWithOnlyBookedSlots([]);
      }
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  };

  // Function to fetch pet passes from API
  const fetchPetPasses = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER+ `/petpass/${profileID}`);
      if (response.ok) {
        let data = await response.json();

        // Sorting pet passes by updatedAt timestamp
        data = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setPetPasses(data);
      }
      else {
        console.error('Fehler beim Abrufen der Buchungen');
        setPetPasses([]);

      };
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  }

  // Function to handle profile updates
  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + `/profile/patch/${profileID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedData),
      });

      console.log(response)
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        showToast('Änderungen gespeichert');
      } else {
        showToast('Änderungen konnten nicht gespeichert werden');
      }
    }
    catch (error) {
      console.error('Netzwerkfehler', error);
    }

  };

  // Function to toggle the favorite status of the profile
  const toggleFavorite = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + `/profile/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ userID: user_mongoID, favoriteID: profileID }),
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);

        setProfileData(prevProfileData => {
          const updatedFavoritedBy = [...prevProfileData.favoritedBy];
          if (isFavorited) {
            const index = updatedFavoritedBy.indexOf(user_mongoID);
            if (index > -1) {
              updatedFavoritedBy.splice(index, 1);
            }
          } else {
            updatedFavoritedBy.push(user_mongoID);
          }
          return {
            ...prevProfileData,
            favoritedBy: updatedFavoritedBy
          };
        });

      } else {
        console.error('Fehler beim Umschalten des Favoritenstatus');
      }
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  };

  const showToast = (message) => {
    setSaveMessage(message);
    setTimeout(() => {
      setSaveMessage(null);
    }, 5000);
  };

  // Function to open the 'About Me' modal
  const openAboutMeModal = () => {
    setAboutMeText(profileData.aboutme || '');
    setAboutMeModal(true);
  };

  // Function to handle saving changes to 'About Me'
  const handleSaveAboutMe = async (newText) => {
    const updatedData = { aboutme: newText };
    await handleUpdateProfile(updatedData);
    setAboutMeModal(false);
  };

  // Function to open the services modal
  const openServicesModal = () => {
    setServicesModal(true);
    setServices({
      dog: profileData.dog,
      cat: profileData.cat,
      serviceList: {
        hausbesuch: profileData.hausbesuch || { offered: false, price: 0 },
        gassi: profileData.gassi || { offered: false, price: 0 },
        training: profileData.training || { offered: false, price: 0 },
        herberge: profileData.herberge || { offered: false, price: 0 },
        tierarzt: profileData.tierarzt || { offered: false, price: 0 },
      }
    });
  };

  // Function to handle saving changes to services
  const handleSaveServices = async (updatedServices) => {
    setServicesModal(false);
    const updatedData = {
      dog: updatedServices.dog,
      cat: updatedServices.cat,
      hausbesuch: updatedServices.serviceList.hausbesuch,
      gassi: updatedServices.serviceList.gassi,
      training: updatedServices.serviceList.training,
      herberge: updatedServices.serviceList.herberge,
      tierarzt: updatedServices.serviceList.tierarzt,
    };
    await handleUpdateProfile(updatedData)
  };

  // Function to open the 'Location' modal
  const openLocationModal = () => {
    console.log(profileData)
    setLocation(profileData.location);
    setLocationModal(true);
  };

  // Function to handle saving changes to 'Location'
  const handleSaveLocation = async (newLocation) => {
    const updatedData = { location: newLocation };
    await handleUpdateProfile(updatedData);
    setLocationModal(false);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === "pawsome") {
      nav(`/profil/${id}`);
    }
    else if (tabName === "reviews") {
      nav(`/profil/${id}/pinnwand`);
    }
    else if (tabName === "passes") {
      nav(`/profil/${id}/haustierpaesse`);
    }
    else if (tabName === "gallery") {
      nav(`/profil/${id}/galerie`);
    }
    else if (tabName === "book") {
      nav(`/profil/${id}/termin`);
    }
  };

  // Rendering logic for the profile page
  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-body">
      <ProfileHeader
        profileData={profileData}
        isProfileOwner={isProfileOwner}
        toggleFav={toggleFavorite}
        isFav={isFavorited}
        daysWithActiveSlots={daysWithActiveSlots}
        daysWithOnlyBookedSlots={daysWithOnlyBookedSlots}
      />

      {/* Tab-Navigation */}
      <div className='gradient-bg'>
        <div className="profile-tabs">
          <button className={`${activeTab === 'pawsome' ? 'active' : ''}`}
            onClick={() => handleTabChange('pawsome')}>I’m Pawsome</button>
          <button className={`${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}>Pinnwand</button>
          <button className={`${activeTab === 'passes' ? 'active' : ''}`}
            onClick={() => handleTabChange('passes')}>Haustierpässe</button>
          {/* <button className={`${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => handleTabChange('gallery')}>Galerie</button> */}
          <button className={`${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => handleTabChange('book')}>Termin</button>
        </div>
      </div>

      <div className='toast-container'>
        {saveMessage && (
          <div className='toast-message'>
            {saveMessage}
          </div>
        )}
      </div>

      <div className="tab-content-container">
        <div className="tab-content">
          {activeTab === 'pawsome' && (
            <>
              {!isProfileOwner &&
                !profileData.aboutme &&
                !((profileData.dog || profileData.cat) && profileData.activities && profileData.activities.some(activity => activity.offered)) &&
                !(daysWithActiveSlots.length >= 1 || daysWithOnlyBookedSlots.length >= 1) &&
                !profileData.location.address && (
                  <div className="no-reviews">
                    <div className='no-content-img'>
                      <img src={emptyPinboard} alt="Keine Bewertungen gefunden" height={150} />
                      <p>Noch keine Beiträge</p>
                    </div>
                  </div>
                )}
              {(profileData.aboutme || isProfileOwner) &&
                <AboutMe
                  text={profileData.aboutme}
                  isProfileOwner={isProfileOwner}
                  onEdit={openAboutMeModal} />
              }
              {aboutMeModal && <AboutMeModal
                initialText={aboutMeText}
                onSave={handleSaveAboutMe}
                onClose={() => setAboutMeModal(false)} />}
              {(isProfileOwner || ((profileData.dog || profileData.cat) /* && profileData.activities && profileData.activities.some(activity => activity.offered) */)) &&
                <Services
                  profileData={profileData}
                  isProfileOwner={isProfileOwner}
                  onEdit={openServicesModal} />
              }
              {servicesModal &&
                <ServicesModal
                  services={services}
                  onSave={handleSaveServices}
                  onClose={() => setServicesModal(false)}
                />
              }
              {(isProfileOwner || profileData.location.address) &&
                <GoogleMapsWrapper>
                  <Location
                    profileData={profileData}
                    isProfileOwner={isProfileOwner}
                    onEdit={openLocationModal}
                    location={location} />
                </GoogleMapsWrapper>
              }
              {locationModal &&
                <GoogleMapsWrapper>
                  <LocationModal
                    profileData={profileData}
                    onSave={handleSaveLocation}
                    onClose={() => setLocationModal(false)}
                    location={location} />
                </GoogleMapsWrapper>
              }
              {(isProfileOwner || daysWithActiveSlots.length >= 1 || daysWithOnlyBookedSlots.length >= 1) &&
                <Availability
                  isProfileOwner={isProfileOwner}
                  daysWithActiveSlots={daysWithActiveSlots}
                  daysWithOnlyBookedSlots={daysWithOnlyBookedSlots}
                  onEdit={() => {
                    handleTabChange('book');
                    window.scrollTo(0, 0);
                  }} />
              }
            </>
          )}
          {activeTab === 'reviews' && <Reviews
            profileID={profileID}
            accessToken={accessToken}
            userID={user_mongoID}
            isProfileOwner={isProfileOwner}
            showToast={showToast}
          />}
          {activeTab === 'passes' && <PetPass
            profileID={profileID}
            isProfileOwner={isProfileOwner}
            accessToken={accessToken}
            petPasses={petPasses}
            setPetPasses={setPetPasses}
            showToast={showToast}
          />}
          {/*           {activeTab === 'gallery' && <Gallery
            profileID={profileID}
            isProfileOwner={isProfileOwner}
            accessToken={accessToken}
          />} */}

          {activeTab === 'book' && (
            !isProfileOwner
              ? <RequestBooking
                profileID={profileID}
                profileData={profileData}
                accessToken={accessToken}
                userID={user_mongoID}
                showToast={showToast} />
              : <Booking
                profileID={profileID}
                accessToken={accessToken}
                showToast={showToast}
                daysWithActiveSlots={daysWithActiveSlots}
                daysWithOnlyBookedSlots={daysWithOnlyBookedSlots}
                fetchBookedDays={fetchBookedDays}
              />
          )}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    user_mongoID: state.authenticationReducer.user_mongoID,
    userID: state.authenticationReducer.userID,
    accessToken: state.authenticationReducer.accessToken

  };
}
const mapDispatchToProps = dispatch => bindActionCreators({
  cookieCheck: authenticationService.cookieCheck
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Profile);