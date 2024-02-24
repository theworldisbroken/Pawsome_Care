import React, { useState } from 'react';
import { GoogleMap, Circle } from '@react-google-maps/api';
import editIcon from "../../../../layout/images/icon-edit.png";
import locationIcon from "../../../../layout/images/icon-location.png";

function Location({ profileData, isProfileOwner, onEdit }) {

    return (

        <div className="services-prices-wrapper">

            <div className="heading-with-line">
                <h2> Standort</h2>
                <div className="line"></div>
            </div>

            <div className="content-box">

                <div className="map-content">
                    <div>
                        {profileData.location.address && (
                            <div>
                                <img src={locationIcon} alt="Standort-Icon" width={20} />
                                <p>{profileData.location.address} </p>
                            </div>
                        )}
                        <div className="edit-btn">
                            {isProfileOwner && (
                                <button onClick={onEdit}><img src={editIcon} alt="edit-Icon" width={25} title="Bearbeiten"/></button>
                            )}
                        </div>
                    </div>
                    <div>
                        {profileData.location.address && (

                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '400px' }}
                                center={{
                                    lat: profileData.location.coordinates[0],
                                    lng: profileData.location.coordinates[1]
                                }}
                                zoom={12}
                                options={{
                                    gestureHandling: 'none',
                                    zoomControl: true,
                                    mapTypeControl: false,
                                    scaleControl: false,
                                    streetViewControl: false,
                                    rotateControl: false,
                                }}
                            >
                                <Circle
                                    center={{
                                        lat: profileData.location.coordinates[0],
                                        lng: profileData.location.coordinates[1]
                                    }}
                                    radius={1000} 
                                    options={{
                                        strokeColor: "#FF0000",
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                        fillColor: "#FF0000",
                                        fillOpacity: 0.35,
                                        clickable: false,
                                        draggable: false,
                                        editable: false,
                                        visible: true,
                                        zIndex: 1
                                    }}
                                />
                            </GoogleMap>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );

}

export default Location;
