import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import PetPassCard from '../profile/petpass/PetPassCard';
import BookingReviewModal from './BookingReviewModal'
import ReviewIcon from "../../../layout/images/icon-review.png";
import AcceptIcon from "../../../layout/images/icon-accept.png";
import DeclineIcon from "../../../layout/images/icon-decline.png";
import RedEmIcon from "../../../layout/images/icon-red-em.png";
import RedDotIcon from "../../../layout/images/icon-red-dot.png";
import BookingMapModal from './BookingMapModal';
import GoogleMapsWrapper from '../../GoogleMapsWrapper'
import BookingPetPassModal from './BookingPetPassModal';
import cat from "../../../layout/images/katze.png";
import profilePictureDummy from '../../../layout/images/ProfilePictureDummy.png'
import { Link } from 'react-router-dom';


/**
 * Component to display and manage individual booking items.
 * It shows a summary of the booking and provides expanded details on click.
 * 
 * Props:
 * - booking: The booking object containing all booking-related details.
 * - toggleDetails: Function to toggle the display of expanded booking details.
 * - expandedBookings: An object tracking which bookings are currently expanded.
 * - bookedBy: Boolean indicating if the booking was made by the current user.
 * - onUpdate: Function to update the booking status (accept, reject, or cancel).
 */
const BookingItem = ({ booking, toggleDetails, handleNewChange, expandedBookings, bookedBy, onUpdate, handleCreateReview, handleDeclineReview }) => {

    const [modalPetPass, setModalPetPass] = useState(false);
    const [modalReview, setModalReview] = useState(false);
    const [mapModal, setMapModal] = useState(false)

    const statusLabels = {
        declined: "ABGELEHNT",
        accepted: "AKZEPTIERT",
        current: "LAUFEND",
        done: "ERLEDIGT",
        cancelled: "STORNIERT",
        requested: "ANGEFRAGT"
    };

    const activityDisplayNames = {
        herberge: "Herberge",
        gassi: "Gassi",
        training: "Training",
        tierarzt: "Tierarzt",
        hausbesuch: "Hausbesuch"
    };

    const receiver = bookedBy ? booking.bookedFrom : booking.bookedBy;

    const handleAccept = (e) => {
        e.stopPropagation();
        onUpdate(booking._id, { action: "accept" });
    };

    const handleDecline = (e) => {
        e.stopPropagation();
        onUpdate(booking._id, { action: 'decline' });
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        onUpdate(booking._id, { action: 'cancel' });
    };

    const handleReview = (e) => {
        e.stopPropagation();
        setModalReview(true);
    };

    const handleReviewDecline = (e) => {
        e.stopPropagation();
        handleDeclineReview(booking._id);
    };

    const handleToggleDetails = () => {
        toggleDetails(booking._id);
        if ((bookedBy && booking.isNewCreator) || (!bookedBy && booking.isNewProvider)) {
            handleNewChange(booking._id, bookedBy);
        }
    };

    let actionButtons;
    switch (booking.status) {
        case 'requested':
            if (bookedBy) {
                actionButtons =
                    <div className='bookings-button'>
                        <button
                            className="contact-btn" onClick={handleDecline}><img src={DeclineIcon} alt="decline-icon" width={25} title="Ablehnen"/>
                        </button>
                    </div>
            } else {
                actionButtons = (
                    <>
                        <div className='bookings-buttons'>
                            <button className="contact-btn" onClick={handleAccept}><img src={AcceptIcon} alt="accept-icon" width={25} title="Akzeptieren"/></button>
                            <button className="contact-btn" onClick={handleDecline}><img src={DeclineIcon} alt="decline-icon" width={25} title="Ablehnen"/></button>
                        </div>
                    </>
                );
            }
            break;
        case 'active':
            actionButtons =
                <div className='bookings-button'>
                    <button
                        className="contact-btn" onClick={handleCancel}><img src={DeclineIcon} alt="decline-icon" width={25} title="Stornieren"/>
                    </button>
                </div>
            break;
        case 'current':
        case 'done':
            if ((bookedBy && !booking.reviewCreator) || (!bookedBy && !booking.reviewProvider)) {
                actionButtons =
                    <div className='bookings-button'>
                        <button
                            className="contact-btn" onClick={handleReview}><img src={ReviewIcon} alt="review-icon" width={35} title="Bewertung schreiben"/>
                        </button>
                    </div>
            }
            break;
        default:
            actionButtons = null;
    }

    console.log(booking)
    const formattedDate = format(new Date(booking.date), 'dd.MM.yyyy');
    const formattedPrice = `${booking.totalPrice.toFixed(2)} €`;
    const remarks = booking.remarks || "-";

    const openPetPassModal = (e) => {
        e.stopPropagation();
        setModalPetPass(true);
    };

    const openMapModal = (e) => {
        e.stopPropagation();
        setMapModal(true)
    }

    console.log(booking.location)

    return (
        <div>
            <div className="content-box" onClick={() => handleToggleDetails()}>
                <div className="booking-summary" >
                    <div>
                        <span className={`booking-arrow ${expandedBookings[booking._id] ? 'down' : 'up'}`}>▶</span>
                        <p>Datum: {formattedDate}</p>
                        <p>Zeit: {booking.startTime} - {booking.endTime} Uhr</p>
                        <p>Preis: {formattedPrice}</p>
                    </div>
                    <div className="booking-info">
                        <div className={`booking-status status-${booking.status.toLowerCase()}`}>
                            <p>{statusLabels[booking.status]}</p>
                        </div>
                        <div className="booking-icon-container">
                            {((bookedBy && booking.isNewCreator) || (!bookedBy && booking.isNewProvider)) &&
                                <img src={RedDotIcon} alt="new-booking-icon" width={10} />}
                            {((bookedBy && !booking.reviewCreator) || (!bookedBy && !booking.reviewProvider)) && (booking.status === "current" || booking.status === "done") &&
                                <img src={RedEmIcon} alt="rate-icon" height={20} width={10} />}
                        </div>
                    </div>
                </div>
                {expandedBookings[booking._id] && (
                    <div className="booking-details">
                        <div className='bookinginformation-content'>
                            <div>
                                <Link to={`/profil/${receiver.userID}`}>
                                    <img src={receiver.profilePicture
                                        ? `${process.env.REACT_APP_SERVER}/pictures/${receiver.profilePicture}`
                                        : profilePictureDummy} alt="cat" />
                                </Link>
                                <p>@{receiver.userID}</p>
                            </div>
                            <div className='confirmation-data'>
                                <div>
                                    <label>Ersteller:</label>
                                    <p>{receiver.firstName}</p>
                                </div>
                                <div>
                                    <label>Aktivität:</label>
                                    <p>{booking.activities.map(activity => activityDisplayNames[activity.activity] || activity.activity).join(', ')}</p>
                                </div>
                                <div className="bookings-pointer" onClick={openPetPassModal}>
                                    <label>Haustiere:</label>
                                    <p>{booking.petPasses.map(petpass => petpass.name).join(', ')}</p>
                                    <p>🛈</p>
                                </div>
                                <div className="bookings-pointer" onClick={openMapModal}>
                                    <label>Treffpunkt:</label>
                                    <p >{booking.location.address}</p>
                                    <p>🛈</p>
                                </div>
                                {/* <p>Gewichtung: {booking.activities.map(activity => activity.weight).join(', ')}</p> */}
                                <div>
                                    <label>Anmerkung:</label>
                                    <p>{remarks}</p>
                                </div>
                            </div>
                        </div>
                        {actionButtons}
                    </div>
                )}
            </div>
            {modalReview &&
                <BookingReviewModal
                    onClose={() => setModalReview(false)}
                    onSave={handleCreateReview}
                    id={booking._id}
                    receiver={receiver._id}
                />}
            {modalPetPass &&
                <BookingPetPassModal
                    onClose={() => setModalPetPass(false)}
                    petPasses={booking.petPasses}
                />
            }

            {mapModal &&
                <GoogleMapsWrapper>
                    <BookingMapModal
                        onClose={() => setMapModal(false)}
                        selectedLocation={booking.location}
                    />
                </GoogleMapsWrapper>}
        </div>
    );
};

export default BookingItem;