import React from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries = ["places"];

const GoogleMapsWrapper = ({ children }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
        libraries,
    });

    if (loadError) return <div>Fehler beim Laden der Karten</div>;
    if (!isLoaded) return <div>Laden...</div>;

    return React.Children.map(children, child => {
        return React.cloneElement(child);
    });};

export default GoogleMapsWrapper;