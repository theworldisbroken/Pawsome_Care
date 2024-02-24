import React, { useState, useEffect } from 'react';
import { bindActionCreators } from "redux";
import { connect } from "react-redux"
import * as authenticationService from "../authentication/state/AuthenticationService";
import BookingItem from "./BookingItem"
import emptyPinboard from "../../../layout/images/empty-pinboard.png";
import RedDotIcon from "../../../layout/images/icon-red-dot.png";

/**
 * FindBookings is a component that manages and displays bookings for a user.
 * It presents a tabbed interface for viewing different types of bookings: "requests" and "bookings".
 *
 * Props:
 * - cookieCheck: Function to verify if the user's cookie is valid.
 * - user_mongoID: The MongoDB ID of the current user.
 * - accessToken: The user's access token for authentication.
 */
const FindBookings = (props) => {
  // State declarations for managing different types of bookings
  const [byBookings, setByBookings] = useState([]);
  const [fromBookings, setFromBookings] = useState([]);
  const [byOtherBookings, setByOtherBookings] = useState([]);
  const [fromOtherBookings, setFromOtherBookings] = useState([]);
  const { cookieCheck, user_mongoID, accessToken } = props;
  const [activeTab, setActiveTab] = useState('bookings');
  const [expandedBookings, setExpandedBookings] = useState({});
  const [showOtherBookings, setShowOtherBookings] = useState(false);

  const [bookingFilter, setBookingFilter] = useState({ declined: false, cancelled: false, done: false });
  const [saveMessage, setSaveMessage] = useState(null);

  const [isNewBookings, setIsNewBookings] = useState(false);
  const [isNewRequests, setIsNewRequests] = useState(false);

  // Validate user session
  useEffect(() => {
    cookieCheck()
  }, [cookieCheck]);

  // Fetch bookings when user ID is available
  useEffect(() => {
    if (user_mongoID) fetchBookings();
  }, [user_mongoID]);

  // Fetches all bookings related to the user
  const fetchBookings = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER +"/booking", {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error('No bookings found');
      }
      const allBookings = await response.json();

      const activeByBookings = filterAndSortActiveBookings(allBookings.filter(booking => booking.bookedBy._id === user_mongoID), true, 'isNewCreator');
      const activeFromBookings = filterAndSortActiveBookings(allBookings.filter(booking => booking.bookedFrom._id === user_mongoID), false, 'isNewProvider');

      const otherByBookings = allBookings.filter(booking => booking.bookedBy._id === user_mongoID && !activeByBookings.includes(booking));
      const otherFromBookings = allBookings.filter(booking => booking.bookedFrom._id === user_mongoID && !activeFromBookings.includes(booking));

      setByBookings(activeByBookings);
      setFromBookings(activeFromBookings);
      setByOtherBookings(otherByBookings);
      setFromOtherBookings(otherFromBookings);
      setIsNewBookings(activeByBookings.some(item => item.isNewCreator));
      setIsNewRequests(activeFromBookings.some(item => item.isNewProvider));

      setActiveTab(activeFromBookings.length > activeByBookings.length ? 'requests' : 'bookings');

    } catch (error) {
      console.error(error);
    }
  };


  const filterAndSortActiveBookings = (bookings, isCreator, isNewField) => {
    const active = bookings.filter(booking => {
      return booking.status === 'requested' ||
        booking.status === 'accepted' ||
        booking.status === 'current' ||
        ((booking.status === 'declined' || booking.status === 'cancelled') && ((isCreator && booking.isNewCreator) || (!isCreator && booking.isNewProvider))) ||
        (booking.status === 'done' && ((isCreator && !booking.reviewCreator) || (!isCreator && !booking.reviewProvider)));
    });

    // Sortieren Sie nur die aktiven Buchungen nach isNew
    return active.sort((a, b) => {
      if (a[isNewField] && !b[isNewField]) {
        return -1;
      } else if (!a[isNewField] && b[isNewField]) {
        return 1;
      }
      return 0; // Keine Änderung in der Reihenfolge, wenn beide gleich sind
    });
  };


  // Handles booking updates, such as accepting or rejecting
  const handleUpdateBooking = async (bookingId, updateData) => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER+`/booking/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updateData)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === "accepted") {
          showToast("Akzeptiert")
        }
        else if (data.status === "declined") {
          showToast("Abgelehnt")
        }
        else if (data.status === "cancelled") {
          showToast("Storniert")
        }
        fetchBookings()
      } else {
        showToast("Ein Fehler ist aufgetreten")
      }
    } catch (error) {
      console.error('Fehler: ', error);
    }
  };

  const updateBookingInState = (bookingId, isBooking) => {
    if (isBooking) {
      setByBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId ? { ...booking, isNewCreator: false } : booking
        )
      );
    } else {
      setFromBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId ? { ...booking, isNewProvider: false } : booking
        )
      );
    }
  };


  const handleNewChange = async (bookingId, isBooking) => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + `/booking/isNew/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (response.ok) {
        updateBookingInState(bookingId, isBooking);

        const newBookingsExist = byBookings.some(item => item.isNewCreator && item._id !== bookingId);
        const newRequestsExist = fromBookings.some(item => item.isNewProvider && item._id !== bookingId);

        setIsNewBookings(newBookingsExist);
        setIsNewRequests(newRequestsExist);
      } else {
        throw new Error('Fehler beim Aktualisieren der Buchung');
      }
    } catch (error) {
      console.error('Fehler: ', error);
    }
  };

  // Function to create a new review
  const handleCreateReview = async (receiver, text, bookingID, rating) => {
    const data = {
      creator: user_mongoID,
      receiver: receiver,
      text: text,
      bookingID: bookingID,
      rating: rating
    }
    const response = await fetch(process.env.REACT_APP_SERVER + `/review/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      fetchBookings();
      showToast("Gespeichert")
    } else {
      showToast("Ein Fehler ist aufgetreten")
    }
  };

  // Function to create a new review
  const handleDeclineReview = async (id) => {
    const response = await fetch(process.env.REACT_APP_SERVER + `/booking/review/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });

    if (response.ok) {

    } else {
    }
  };

  // Toggles the details of a specific booking
  const toggleDetails = (bookingId) => {
    setExpandedBookings(prevState => ({
      ...prevState,
      [bookingId]: !prevState[bookingId]
    }));
    // const isCurrentlyExpanded = expandedBookings[bookingId];
    // setExpandedBookings(isCurrentlyExpanded ? {} : { [bookingId]: true });
  };

  // Toggles the display of other (non-active) bookings
  const toggleOtherBookings = () => {
    setShowOtherBookings(prev => !prev);
  };


  const getFilteredBookings = (bookings, filter) => {
    if (!filter.declined && !filter.cancelled && !filter.done) {
      return bookings;
    }

    return bookings.filter(booking => {
      return (filter.declined && booking.status === 'declined') ||
        (filter.cancelled && booking.status === 'cancelled') ||
        (filter.done && booking.status === 'done');
    });
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setShowOtherBookings(false);
    setExpandedBookings({});
  };

  const showToast = (message) => {
    setSaveMessage(message);
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };


  return (
    <div className='profile-body'>
      <div className='toast-container'>
        {saveMessage && (
          <div className='toast-message'>
            {saveMessage}
          </div>
        )}
      </div>
      <div className="booking-header-wrapper">
        <div className='gradient-bg'>
          <div className="profile-tabs">
            <button
              className={`${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => handleTabChange('requests')}>
              Aufträge {isNewRequests && <img src={RedDotIcon} alt="new-booking-icon" width={10} />}
            </button>
            <button
              className={`${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => handleTabChange('bookings')}>
              Buchungen {isNewBookings && <img src={RedDotIcon} alt="new-booking-icon" width={10} />}
            </button>
          </div>
        </div>
        <div className="tab-content-container">
          <div className="tab-content">
            {
              activeTab === 'requests' && fromBookings.length === 0
                ? (
                  <div className="no-reviews">
                    <div className='no-content-img'>
                      <img src={emptyPinboard} alt="Keine Bewertungen gefunden" height={150} />
                      <p>Noch keine Beiträge</p>
                    </div>
                  </div>
                )
                : (
                  activeTab === 'requests' && fromBookings.map(booking => (
                    <BookingItem
                      key={booking._id}
                      booking={booking}
                      toggleDetails={toggleDetails}
                      handleNewChange={handleNewChange}
                      expandedBookings={expandedBookings}
                      bookedBy={false}
                      onUpdate={handleUpdateBooking}
                      handleCreateReview={handleCreateReview}
                      handleDeclineReview={handleDeclineReview}
                      setExpandedBookings={setExpandedBookings}
                    />
                  ))
                )
            }
            {
              activeTab === 'bookings' && byBookings.length === 0
                ? (
                  <div className="no-reviews">
                    <div className='no-content-img'>
                      <img src={emptyPinboard} alt="Keine Bewertungen gefunden" height={150} />
                      <p>Noch keine Beiträge</p>
                    </div>
                  </div>
                )
                : (
                  activeTab === 'bookings' && byBookings.map(booking => (
                    <BookingItem
                      key={booking._id}
                      booking={booking}
                      toggleDetails={toggleDetails}
                      handleNewChange={handleNewChange}
                      bookedBy={true}
                      expandedBookings={expandedBookings}
                      onUpdate={handleUpdateBooking}
                      handleCreateReview={handleCreateReview}
                      handleDeclineReview={handleDeclineReview}
                      setExpandedBookings={setExpandedBookings}
                    />
                  ))
                )
            }
            <div onClick={toggleOtherBookings} className="heading-with-line clicky">
              <span className={`booking-arrow grey-booking ${showOtherBookings ? 'down' : 'up'}`}>▶</span>
              <h3>Abgeschlossene Buchungen</h3>
              <div className="line"></div>
            </div>
            {showOtherBookings && (

              <div className="other-bookings">
                <div className="filter-checkboxes">
                  <label>
                    <input type="checkbox" checked={bookingFilter.declined} onChange={() => setBookingFilter({ ...bookingFilter, declined: !bookingFilter.declined })} />
                    Abgelehnt
                  </label>
                  <label>
                    <input type="checkbox" checked={bookingFilter.cancelled} onChange={() => setBookingFilter({ ...bookingFilter, cancelled: !bookingFilter.cancelled })} />

                    Storniert
                  </label>
                  <label>
                    <input type="checkbox" checked={bookingFilter.done} onChange={() => setBookingFilter({ ...bookingFilter, done: !bookingFilter.done })} />

                    Erledigt
                  </label>
                </div>
                {
                  activeTab === 'requests' && getFilteredBookings(fromOtherBookings, bookingFilter).length === 0
                    ? (
                      <div className="no-reviews">
                        <div className='no-content-img'>
                          <img src={emptyPinboard} alt="Keine Bewertungen gefunden" height={150} />
                          <p>Noch keine Beiträge</p>
                        </div>
                      </div>
                    )
                    : (
                      activeTab === 'requests' && getFilteredBookings(fromOtherBookings, bookingFilter).map(booking => (
                        <BookingItem
                          key={booking._id}
                          booking={booking}
                          toggleDetails={toggleDetails}
                          bookedBy={false}
                          expandedBookings={expandedBookings} />
                      ))
                    )
                }

                {
                  activeTab === 'bookings' && getFilteredBookings(byOtherBookings, bookingFilter).length === 0
                    ? (
                      <div className="no-reviews">
                        <div className='no-content-img'>
                          <img src={emptyPinboard} alt="Keine Bewertungen gefunden" height={150} />
                          <p>Noch keine Beiträge</p>
                        </div>
                      </div>
                    )
                    : (
                      activeTab === 'bookings' && getFilteredBookings(byOtherBookings, bookingFilter).map(booking => (
                        <BookingItem
                          key={booking._id}
                          booking={booking}
                          toggleDetails={toggleDetails}
                          bookedBy={true}
                          expandedBookings={expandedBookings}
                        />
                      ))
                    )
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    user_mongoID: state.authenticationReducer.user_mongoID,
    accessToken: state.authenticationReducer.accessToken

  };
}
const mapDispatchToProps = dispatch => bindActionCreators({
  cookieCheck: authenticationService.cookieCheck
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(FindBookings);

