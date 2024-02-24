import React, { useState } from 'react';
import { format, startOfDay } from 'date-fns';
import cat from "../../../../layout/images/katze.png";
import profilePictureDummy from '../../../../layout/images/ProfilePictureDummy.png'

const RequestBookingConfirmation = ({ onClose, slots, date, activities, petPasses, notes, location, profileData, totalPrice, onSave }) => {

    const handleSaveClick = () => {
        onSave();
    };

    const startTime = slots.start ? format(slots.start, 'HH:mm') : '';
    const endTime = slots.end ? format(slots.end, 'HH:mm') : '';
    const activityDisplayNames = {
        herberge: "Herberge",
        gassi: "Gassi",
        training: "Training",
        tierarzt: "Tierarzt",
        hausbesuch: "Hausbesuch"
    };

    return (
        <div className="modal-overlay">

            <div className='modal-container'>

                <div className='h2-close-btn'>
                    <h2>Auftrag Zusammenfassung</h2>
                </div>

                <div className='modal-box'>
                    <div className='bookingconfirmation-content'>
                        <div>
                            <img
                                alt='profile pic'
                                style={{ objectFit: "cover" }}
                                src={profileData.user.profilePicture
                                    ? `${process.env.REACT_APP_SERVER}/pictures/${profileData.user.profilePicture}`
                                    : profilePictureDummy}
                                className="mini-profile-image"
                            />
                            <p>{profileData.user.firstName}</p>
                        </div>
                        <div className='confirmation-data'>
                            <div>
                                <label>Datum:</label>
                                <p>{date ? format(new Date(date), 'dd.MM.yyyy') : ""}</p>
                            </div>
                            <div>
                                <label>Uhrzeit:</label>
                                <p>{startTime} - {endTime} Uhr</p>
                            </div>
                            <div>
                                <label>Service:</label>
                                <p>{
                                    Object.keys(activities)
                                        .filter(key => activities[key] === true)
                                        .map(key => activityDisplayNames[key] || key)
                                        .join(', ')
                                }</p>
                            </div>

                            <div>
                                <label>Haustiere: </label>
                                <p>{petPasses.map(petPass => petPass.name).join(', ')}</p>
                            </div>
                            <div>
                                <label>Treffpunkt:</label>
                                <p> {location?.address}</p>
                            </div>
                            <div>
                                <label>Anmerkung: </label>
                                <p>{notes ? notes : "-"}</p>
                            </div>
                            <div>
                                <label>Gesamtpreis: </label>
                                <p>{totalPrice}€</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <button className="reset-btn" onClick={onClose}>Zurück</button>
                    <button className="save-btn" onClick={handleSaveClick}>Auftrag bestätigen</button>
                </div>
            </div>

        </div>
    );
};

export default RequestBookingConfirmation;

