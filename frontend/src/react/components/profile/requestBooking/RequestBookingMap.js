import React, { useState, useEffect } from 'react';
import "../../../../layout/style/userProfile.css"
import GooglePlacesAutocomplete, { geocodeByAddress, geocodeByLatLng } from 'react-google-places-autocomplete';
import { GoogleMap, Circle, Marker } from '@react-google-maps/api';
import deleteIcon from "../../../../layout/images/icon-trashcan.png";
import LocationIcon from "../../../../layout/images/icon-gm-location.png";
import HandIcon from "../../../../layout/images/icon-hand.png";

const RequestBookingMap = ({ profileData, userData, onSave, onClose, location }) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [profileLocation, setProfileLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if (profileData.location && profileData.location.coordinates) {
            setProfileLocation(profileData.location)
        }
    }, [profileData.location]);

    useEffect(() => {
        if (userData.location && userData.location.coordinates) {
            setUserLocation(userData.location)
        }
    }, [userData.location]);

    useEffect(() => {
        if (location && location.address) {
            setSelectedLocation(location)
        }
    }, [location]);

    const handleSaveClick = () => {
        onSave(selectedLocation);
    };


    const updateLocation = async (results) => {
        if (results.length > 0) {
            const addressComponents = results[0].address_components;
            const streetNumber = addressComponents.find(component => component.types.includes('street_number'))?.long_name || '';
            const route = addressComponents.find(component => component.types.includes('route'))?.long_name || '';
            const postalCode = addressComponents.find(component => component.types.includes('postal_code'))?.long_name || '';
            const city = addressComponents.find(component => component.types.includes('locality'))?.long_name || '';

            const formattedAddress = `${streetNumber} ${route ? route + ', ' : ''}${postalCode} ${city}`;
            const newLat = results[0].geometry.location.lat();
            const newLng = results[0].geometry.location.lng();
            setSelectedLocation({
                address: formattedAddress,
                lat: newLat,
                lng: newLng
            });
        }
    }

    const handleChange = async (value) => {
        try {
            if (!value || !value.value || !value.value.place_id) {
                console.error('Keine gültige place_id gefunden');
                return;
            }
            updateLocation(await geocodeByAddress(value.label));
        } catch (error) {
            console.error('Fehler beim Geocoding: ', error);
        }
    };

    const handleMarkerDragEnd = async (event) => {
        try {
            updateLocation(await geocodeByLatLng({ lat: event.latLng.lat(), lng: event.latLng.lng() }));
        } catch (error) {
            console.error('Fehler beim Reverse Geocoding: ', error);
        }
    };

    const handleReset = () => {
        setSelectedLocation(null)
    };


    return (
        <div className="modal-overlay">

            <div className='modal-container'>
                <h2>Treffpunkt auswählen</h2>
                <div className='modal-box'>
                    <div className='set-meetingplace-container'>

                        <div className='autocomplete-delete-container'>
                            <GooglePlacesAutocomplete
                                apiOptions={{ language: 'de', region: 'de' }}
                                autocompletionRequest={{
                                    componentRestrictions: {
                                        country: ['de'],
                                    }
                                }}
                                selectProps={{
                                    value: "test",
                                    placeholder: selectedLocation?.address ? selectedLocation.address : "Adresse eingeben oder auf Karte klicken",
                                    onChange: handleChange,
                                    styles: {
                                        indicatorsContainer: (provided) => ({
                                            ...provided,
                                            display: 'none',
                                        }),
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            minHeight: '0px'
                                        }),
                                    }
                                }}

                                types={['postal_code']}
                            />
                            <button className="delete-btn" type="button" onClick={handleReset}>
                                <img src={deleteIcon} alt="delete-icon" width={30} />
                            </button>
                        </div>

                        <div className='map-legend-container'>
                            <div className='map-legend'>
                                <div>
                                    <span className='symbol-you'></span>
                                    <p style={{ fontSize: '16px' }}>Du</p>
                                </div>
                                <div>
                                    <span className='symbol-petsitter'></span>
                                    <p style={{ fontSize: '16px' }}>Tiersitter</p>
                                </div>
                                <div>
                                    <img src={LocationIcon} alt="GM-location-icon" width="22px"></img>
                                    <p style={{ fontSize: '16px' }}>Treffpunkt</p>
                                </div>
                                <div>
                                    <img src={HandIcon} alt="hand-icon" width="22px" height="26px"></img>
                                    <p>Wähle den Treffpunkt indem du den Treffpunkt-Marker verschiebst</p>
                                </div>
                            </div>
                            {profileLocation && (
                                <GoogleMap
                                    mapContainerStyle={{ width: '650px', height: '400px' }}
                                    center={{
                                        lat: selectedLocation ? selectedLocation.lat : profileData.location.coordinates[0],
                                        lng: selectedLocation ? selectedLocation.lng : profileData.location.coordinates[1]
                                    }}
                                    zoom={12}
                                    options={{
                                        mapTypeControl: false,
                                        scaleControl: false,
                                        streetViewControl: false,
                                        rotateControl: false,
                                    }}
                                    onClick={handleMarkerDragEnd}
                                >
                                    <Circle
                                        center={{
                                            lat: profileLocation.coordinates[0],
                                            lng: profileLocation.coordinates[1]
                                        }}
                                        radius={1000}
                                        options={{
                                            strokeColor: "#2A25EE",
                                            strokeOpacity: 0.8,
                                            strokeWeight: 1,
                                            fillColor: "#2825ee5b",
                                            fillOpacity: 0.5,
                                            zIndex: 1
                                        }}
                                    />
                                    {userLocation && <Circle
                                        center={{
                                            lat: userLocation.coordinates[0],
                                            lng: userLocation.coordinates[1]
                                        }}
                                        radius={1000}
                                        options={{
                                            strokeColor: "#ee25b2",
                                            strokeOpacity: 0.8,
                                            strokeWeight: 2,
                                            fillColor: "#ee25b25b",
                                            fillOpacity: 0.5,
                                            zIndex: 1
                                        }}
                                    />
                                    }
                                    <Marker
                                        position={{
                                            lat: selectedLocation ? selectedLocation.lat : profileLocation.coordinates[0],
                                            lng: selectedLocation ? selectedLocation.lng : profileLocation.coordinates[1]
                                        }}
                                        draggable={true}
                                        onDragEnd={handleMarkerDragEnd}
                                        title="Treffpunkt"
                                        options={{
                                            zIndex: 5
                                        }}
                                    />
                                </GoogleMap>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <button className="reset-btn" onClick={onClose}>Zurück</button>
                    <button className="save-btn" onClick={handleSaveClick}>Speichern</button>
                </div>
            </div>

        </div>
    );
};

export default RequestBookingMap;

