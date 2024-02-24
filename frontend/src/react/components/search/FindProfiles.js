import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProfileFilter from './ProfileFilter';
import { format } from 'date-fns';
import "../../../layout/style/search.css"
import cat from "../../../layout/images/katze.png";
import heartIcon from "../../../layout/images/icon-heart.png";
import redheartIcon from "../../../layout/images/icon-redheart.png";
import { bindActionCreators } from "redux";
import { connect } from "react-redux"
import * as authenticationService from "../authentication/state/AuthenticationService";
import Map from './Map';
import GoogleMapsWrapper from '../../GoogleMapsWrapper';
import { formatLastLoggedIn, renderStars } from '../utils/formatLastLoggedIn';
import profilePictureDummy from '../../../layout/images/ProfilePictureDummy.png'
import deleteIcon from "../../../layout/images/icon-trashcan.png";

/**
 * Component to search and display user profiles based on various filters.
 * It allows users to browse through profiles of pet sitters and add them to favorites.
 * 
 * Props:
 * - cookieCheck: Function to verify if the user is authenticated.
 * - user_mongoID: User's MongoDB ID, used to identify the current user.
 * - accessToken: Token for authenticated API requests.
 */
const FindProfiles = (props) => {
    // State for storing fetched profiles
    const [profiles, setProfiles] = useState([]);
    const [count, setCount] = useState(0);
    const [address, setAddress] = useState("Deutschland und Umgebung");
    const [location, setLocation] = useState(/* {
        topLeft: [54.864028001772866, -2.5903320312499956],
        bottomRight: [47.14497437544359, 21.623535156250004],
        center: [51.165637488221606, 9.516601562500004],
        zoom: 5
    } */);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const loc = useLocation();

    // Destructuring props
    const { cookieCheck, user_mongoID, accessToken } = props;

    // Effect to check user authentication on mount
    useEffect(() => {
        cookieCheck()
    }, [cookieCheck]);

    // Function to fetch profiles with optional filters
    const fetchProfiles = async (filters = {}) => {
        const params = new URLSearchParams();
        for (const key in filters) {
            if (Array.isArray(filters[key])) {
                filters[key].forEach(value => params.append(key, value));
            } else {
                params.append(key, filters[key]);
            }
        }

        const url = process.env.REACT_APP_SERVER+ `/search?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('No profiles found');
            }
            console.log("fetched")
            const profilesData = await response.json();
            setProfiles(profilesData.profiles);
            setCount(profilesData.totalCount);
        } catch (error) {
            console.error(error);
        }
    };

    // Function to apply selected filters
    const applyFilters = (filters, sortOption) => {
        const newFilters = { sort: sortOption };
        if (filters.services) newFilters.services = filters.services;
        if (filters.pets) newFilters.pets = filters.pets;
        if (filters.selectedDates) {
            const { from, to } = filters.selectedDates;
            if (from && to) {
                newFilters.dates = [format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd')];
            } else if (from) {
                newFilters.dates = [format(from, 'yyyy-MM-dd')];
            }
        }
        if (filters.location) {
            newFilters.centerLat = filters.location.center[0];
            newFilters.centerLng = filters.location.center[1];
            newFilters.topLeftLat = filters.location.topLeft[0];
            newFilters.topLeftLng = filters.location.topLeft[1];
            newFilters.bottomRightLat = filters.location.bottomRight[0];
            newFilters.bottomRightLng = filters.location.bottomRight[1];
        }
        fetchProfiles(newFilters);
    };

    // Function to handle favorite button click
    const handleFavoriteClick = (e, profileID, index) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(profileID, index);
    };

    // Function to toggle favorite status of a profile
    const toggleFavorite = async (profileID, index) => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER+ `/profile/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ userID: user_mongoID, favoriteID: profileID }),
            });

            if (response.ok) {
                setProfiles(prevProfiles => {
                    return prevProfiles.map((profile, idx) => {
                        if (idx === index) {
                            const isFavorited = profile.profileData.favoritedBy.includes(user_mongoID);
                            return {
                                ...profile,
                                profileData: {
                                    ...profile.profileData,
                                    favoritedBy: isFavorited
                                        ? profile.profileData.favoritedBy.filter(id => id !== user_mongoID)
                                        : [...profile.profileData.favoritedBy, user_mongoID]
                                }
                            };
                        }
                        return profile;
                    });
                });
            } else {
                console.error('Fehler beim Umschalten des Favoritenstatus');
            }
        } catch (error) {
            console.error('Netzwerkfehler', error);
        }
    };

    const handleProfileClick = (profile) => {
        setLocation({
            ...location,
            center: [profile.profileData.location.coordinates[0], profile.profileData.location.coordinates[1]],
            zoom: 11
        });
    }

    const handleProfileHover = (profile) => {
        setSelectedProfile(profile)
    }

    const handleReset = () => {
        setLocation(
            {
                address: "Deutschland und Umgebung",
                topLeft: [54.864028001772866, -2.5903320312499956],
                bottomRight: [47.14497437544359, 21.623535156250004],
                center: [51.165637488221606, 9.516601562500004],
                zoom: 5
            });
    }

    // Rendering logic for displaying profiles and profile filter component
    return (
        <div className="profile-body">
            <div className="find-profiles-wrapper">
                <div className='petsitter-results'>
                    <div className="content-box">
                        <div className='autocomplete-delete-container'>

                            <p>Zeige {profiles.length} von {count} Ergebnissen in {address}</p>
                            <button className="delete-btn" type="button" onClick={handleReset}>
                                <img src={deleteIcon} alt="delete-icon" width={25} />
                            </button>
                        </div>
                        <GoogleMapsWrapper>
                            <Map
                                profiles={profiles}
                                location={location}
                                setLocation={setLocation}
                                selectedProfile={selectedProfile}
                                setSelectedProfile={setSelectedProfile}
                                address={address}
                                setAddress={setAddress}
                                loc={loc}
                            />
                        </GoogleMapsWrapper>
                    </div>
                    <div className='profile-scroll-box'>
                        {profiles.map((profile, index) => (
                            <Link to={`/profil/${profile.profileData.userData.userID}`} 
                            id={`profile-${profile._id}`} 
                            className={`content-box ${selectedProfile && selectedProfile._id === profile._id ? 'selected-profile' : 'not-selected-profile'}`} 
                            key={profile._id}
                            onClick={() => handleProfileClick(profile)}
                            onMouseOver={() => setSelectedProfile(profile)}
                            onMouseOut={() => setSelectedProfile(null)}>
                                <div className='petsitter-content'>
                                    <div className='petsitter-content-left'>
                                        <img
                                            alt='profile pic'
                                            height={100}
                                            width={100}
                                            style={{ objectFit: "cover" }}
                                            src={profile.profileData.userData.profilePicture
                                                ? `${process.env.REACT_APP_SERVER}/pictures/${profile.profileData.userData.profilePicture}`
                                                : profilePictureDummy}
                                        />
                                        <p>@{profile.profileData.userData.userID}</p>
                                    </div>
                                    <div className="petsitter-content-right">
                                        <div className='name-last-login'>
                                            <div><h2>{profile.profileData.userData.firstName}</h2>
                                                {renderStars(profile.profileData.ratingAverage)} ({profile.profileData.ratingCount})</div>
                                            <div><p>Zuletzt aktiv: {formatLastLoggedIn(profile.profileData.userData.last_logged_in)}</p>
                                                <p>Favorisiert: {(profile.profileData.favoritedBy.length)} mal</p>
                                                <p>Distanz: {(profile.distance)}m</p>
                                            </div>
                                        </div>
                                        <div className='petsitter-service-details'>
                                            <div className='petsitter-for'>
                                                <h3>Tiersitter für:</h3>
                                                <ul>
                                                    {profile.profileData.dog && <li>Hunde</li>}
                                                    {profile.profileData.cat && <li>Katzen</li>}
                                                </ul>
                                            </div>
                                            <div>
                                                <h3>Dienste:</h3>
                                                <ul>
                                                    {Object.entries(profile.profileData).map(([key, value]) => {
                                                        if (typeof value === 'object' && value.offered) {
                                                            return <li key={key}>{key}</li>;
                                                        }
                                                        return null;
                                                    })}
                                                </ul>
                                            </div>
                                            {/*   {user_mongoID && user_mongoID !== profile.profileData.user && ( */}
                                            <div>
                                                <button
                                                    className='like-btn'
                                                    onClick={(e) => handleFavoriteClick(e, profile.profileData.user, index)}>
                                                    <img src={profile.profileData.favoritedBy.includes(user_mongoID) ? redheartIcon : heartIcon} alt="heart-icon" width={30} />
                                                </button>
                                            </div>
                                            {/* )} */}

                                        </div>
                                    </div>

                                </div>
                            </Link>

                        ))}
                    </div>
                </div>
                <GoogleMapsWrapper>
                    <ProfileFilter 
                    onSubmit={applyFilters} 
                    location={location} 
                    setLocation={setLocation}
                    handleReset={handleReset} 
                    address={address}/>
                </GoogleMapsWrapper>
            </div>
        </div >
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

export default connect(mapStateToProps, mapDispatchToProps)(FindProfiles);

