import React, { useState, useEffect } from 'react';
import "../../../../layout/style/userProfile.css"
import GooglePlacesAutocomplete, { geocodeByAddress, geocodeByLatLng } from 'react-google-places-autocomplete';
import { GoogleMap, Circle, Marker } from '@react-google-maps/api';
import deleteIcon from "../../../../layout/images/icon-trashcan.png";
import HandIcon from "../../../../layout/images/icon-hand.png";

const LocationModal = ({ onSave, onClose, location }) => {
    const [selectedLocation, setSelectedLocation] = useState(location);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setIsDirty(false);
    }, [location]);

    const handleSave = () => {
        onSave(selectedLocation);
        setIsDirty(false);
    };

    const locationHasChanged = () => {
        return selectedLocation.address !== location.address ||
            selectedLocation.coordinates[0] !== location.coordinates[0] ||
            selectedLocation.coordinates[1] !== location.coordinates[1];
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty && locationHasChanged()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty, selectedLocation, location]);

    const handleClose = () => {
        if (isDirty && locationHasChanged()) {
            console.log(locationHasChanged());
            const confirmClose = window.confirm("Du hast ungespeicherte Änderungen. Bist du sicher, dass du schließen möchtest?");
            if (confirmClose) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleReset = () => {
        setSelectedLocation({ address: null, coordinates: [51, 10] })
        setIsDirty(true);
    };


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

    const updateLocation = async (results) => {
        if (results.length > 0) {
            const addressComponents = results[0].address_components;
            const postalCode = addressComponents.find(component => component.types.includes('postal_code'))?.long_name || '';
            const city = addressComponents.find(component => component.types.includes('locality'))?.long_name || '';

            const formattedAddress = `${postalCode} ${city}`;
            const newLat = results[0].geometry.location.lat();
            const newLng = results[0].geometry.location.lng();
            setSelectedLocation({
                address: formattedAddress,
                coordinates: [newLat, newLng]
            });
            setIsDirty(true);
        }
    }

    return (
        <div className="modal-overlay">

            <div className='modal-container'>
                <h2>Standort bearbeiten</h2>
                <div className='modal-box'>
                <div className='set-meetingplace-container'>
                    <p className='inbox-heading'>Postleitzahl eingeben und bei Bedarf Markierung bewegen  </p>
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
                                <img src={HandIcon} alt="hand-icon" width="22px" height="26px"></img>
                                    <p>Stelle deinen Standort ein, indem du den Kreis verschiebst</p>
                                </div>
                            </div>

                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '400px' }}
                        center={{
                            lat: selectedLocation.coordinates[0],
                            lng: selectedLocation.coordinates[1]
                        }}
                        zoom={selectedLocation.address ? 11 : 5}
                        options={{
                            mapTypeControl: false,
                            scaleControl: false,
                            streetViewControl: false,
                            rotateControl: false,
                        }}
                        onClick={handleMarkerDragEnd}

                    >
                        {selectedLocation.address &&
                            <Circle
                                center={{
                                    lat: selectedLocation.coordinates[0],
                                    lng: selectedLocation.coordinates[1]
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
                                draggable={true}
                                onDragEnd={handleMarkerDragEnd}
                            />
                        }
                    </GoogleMap>
                    </div>
                    </div>
                </div>
                <div>
                    <button className='reset-btn' onClick={handleClose}>Zurück</button>
                    <button className="save-btn" onClick={handleSave}>Speichern</button>
                </div>
            </div>


        </div>
    );
};

export default LocationModal;

