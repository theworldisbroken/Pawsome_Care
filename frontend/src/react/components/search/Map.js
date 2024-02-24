import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import profilePictureDummy from '../../../layout/images/ProfilePictureDummy.png'
import { geocodeByAddress, geocodeByLatLng } from 'react-google-places-autocomplete';

const Map = ({ profiles, location, selectedProfile, setSelectedProfile, setLocation, address, setAddress, loc }) => {
    const mapRef = useRef(null);
    const [locationBounds, setLocationBounds] = useState([]);

    const mapContainerStyle = {
        width: '100%',
        height: '280px',
    };
    const bounds = {
        north: 60,
        south: 42,
        west: -10,
        east: 30,
    };

    useEffect(() => {
        if (loc.state && loc.state.location && mapRef.current) {
            console.log(mapRef)
            console.log(loc.state)
            const searchLocation = loc.state.location;
            console.log(location)
            setLocation({
                ...location,
                center: searchLocation.center,
                zoom: 11
            })
        }
    }, [loc, mapRef.current]);

    const getAddress = async () => {
        const results = await geocodeByLatLng({ lat: location?.center[0] || 51.165637488221606, lng: location?.center[1] || 9.516601562500004});
        if (results.length > 0) {
            console.log(results)
            let address = "";
            const zoomLevel = location?.zoom || 5;
            if (zoomLevel <= 5) {
                address = "Deutschland und Umgebung";
            }
            else if (zoomLevel <= 8) {
                address = results[0].address_components.find(component => component.types.includes("administrative_area_level_1"))?.long_name;
            }
            else if (zoomLevel <= 9) {
                address = results[0].address_components.find(component => component.types.includes("locality"))?.long_name;
            }
            else if (zoomLevel <= 15) {
                const postalCodeComponent = results.find(result => result.address_components.some(component => component.types.includes("postal_code")));
                const localityComponent = results.find(result => result.address_components.some(component => component.types.includes("locality")));
                if (postalCodeComponent && localityComponent) {
                    const postalCode = postalCodeComponent.address_components.find(component => component.types.includes("postal_code")).long_name;
                    const locality = localityComponent.address_components.find(component => component.types.includes("locality")).long_name;
                    address = `${postalCode}, ${locality}`;
                } else {
                    address = results[0].formatted_address;
                }
            }
            setAddress(address)
        }
    }

    const getBounds = async () => {
        console.log("getBounds")
        if (!mapRef.current) return;
        const zoomLevel = mapRef.current.getZoom();
        const bounds = mapRef.current.getBounds();
        console.log(bounds)
        const centerMap = mapRef.current.getCenter();
        const northEast = bounds.getNorthEast();
        const southWest = bounds.getSouthWest();

        const topLeft = { lat: northEast.lat(), lng: southWest.lng() };
        const bottomRight = { lat: southWest.lat(), lng: northEast.lng() };
        const center = { lat: centerMap.lat(), lng: centerMap.lng() }
        setLocation({
            topLeft: [topLeft.lat, topLeft.lng],
            bottomRight: [bottomRight.lat, bottomRight.lng],
            center: [center.lat, center.lng],
            zoom: zoomLevel,
        })
        await getAddress();
    };

    const zoomToLocation = (coordinates) => {
        if (mapRef.current) {
            mapRef.current.panTo({ lat: coordinates[0], lng: coordinates[1] });
            mapRef.current.setZoom(11);
        }
    };



    const getMarkerIcon = (profile) => {
        const isHovered = selectedProfile && selectedProfile._id === profile._id;
        if (location?.zoom >= 11 || isHovered) {
            const size = isHovered ? 40 : 30;
            return {
                url: profile.profileData.userData.profilePicture
                    ? `${process.env.REACT_APP_SERVER}/pictures/${profile.profileData.userData.profilePicture}`
                    : profilePictureDummy,
                scaledSize: new window.google.maps.Size(size, size),
                zIndex: 100
            };
        } else {
            return null;
        }
    };

    const handleMarkerClick = (profile) => {
        setSelectedProfile(profile);
        setLocation({
            ...location,
            address: profile.profileData.location.address,
            center: [profile.profileData.location.coordinates[0], profile.profileData.location.coordinates[1]],
        });
        zoomToLocation(profile.profileData.location.coordinates);
    };

    const scrollToProfile = (profile) => {
        setSelectedProfile(profile)
        const profileElement = document.getElementById(`profile-${profile._id}`);
        if (profileElement) {
            profileElement.scrollIntoView({ block: 'nearest' });
        }
    };




    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: location?.center[0] || 51.165637488221606, lng: location?.center[1] || 9.516601562500004 }}
            zoom={location?.zoom || 5}
            options={{
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                minZoom: 5,
                maxZoom: 14,
                restriction: {
                    latLngBounds: bounds,
                    strictBounds: false,
                }
            }}
            onLoad={(map) => (mapRef.current = map)}
            onDragEnd={getBounds}
            onZoomChanged={getBounds}
        >
            {profiles.map(profile => (
                profile.profileData.location && (
                    <Marker
                        key={/* `${ */profile._id/* }-${currentZoom}` */}
                        position={{
                            lat: profile.profileData.location.coordinates[0],
                            lng: profile.profileData.location.coordinates[1]
                        }}
                        onClick={() => handleMarkerClick(profile)}
                        onMouseOver={() => scrollToProfile(profile)}
                        onMouseOut={() => setSelectedProfile(null)}
                        icon={getMarkerIcon(profile)}
                        zIndex={getMarkerIcon(profile)?.zIndex || 1}
                    />
                )
            ))}
        </GoogleMap>
    );
};

export default Map;
