import React from 'react';
import { GoogleMap, Circle, Marker } from '@react-google-maps/api';

const BookingMapModal = ({ onClose, selectedLocation }) => {

    return (
        <div className="modal-overlay">

            <div className='modal-container'>
                <h2>Standort bearbeiten</h2>
                <div className='modal-box'>
                    <div className='autocomplete-delete-container'>
                        <p>{selectedLocation.address}</p>
                    </div>
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '400px' }}
                        center={{
                            lat: selectedLocation.lat,
                            lng: selectedLocation.lng
                        }}
                        zoom={14}
                        options={{
                            mapTypeControl: false,
                            scaleControl: false,
                            streetViewControl: false,
                            rotateControl: false,
                        }}
                    >
                        <Marker
                            position={{
                                lat: selectedLocation.lat,
                                lng: selectedLocation.lng
                            }}
                        />
                    </GoogleMap>
                </div>
                <div>
                    <button className='reset-btn' onClick={onClose}>Zurück</button>
                </div>
            </div>

        </div>
    );
};

export default BookingMapModal;

