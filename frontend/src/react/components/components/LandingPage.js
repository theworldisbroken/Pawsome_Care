import React, { useState } from 'react';
import { Link } from "react-router-dom";
import "../../../layout/style/landingPage.css";
import HomepageBanner from "../../../layout/images/home-img-1.png";
import Home2 from "../../../layout/images/home-img-2.png";
import Home3 from "../../../layout/images/home-img-3.png";
import Home4 from "../../../layout/images/home-img-4.png";
import Home5 from "../../../layout/images/home-img-5.png";
import Home6 from "../../../layout/images/home-img-6.png";
import Home7 from "../../../layout/images/home-img-7.png";
import Home8 from "../../../layout/images/home-img-8.png";
import Home9 from "../../../layout/images/home-img-9.png";

import GooglePlacesAutocomplete, { geocodeByAddress, geocodeByLatLng } from 'react-google-places-autocomplete';
import GoogleMapsWrapper from '../../GoogleMapsWrapper';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {

  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigate = useNavigate();

  const updateLocation = async (results) => {
    console.log(results)
    if (results.length > 0) {
      const addressComponents = results[0].address_components;
      const postalCode = addressComponents.find(component => component.types.includes('postal_code'))?.long_name || '';
      const city = addressComponents.find(component => component.types.includes('locality'))?.long_name || '';

      const formattedAddress = `${postalCode} ${city}`;
      const newLat = results[0].geometry.location.lat();
      const newLng = results[0].geometry.location.lng();
      setSelectedLocation({
        address: formattedAddress,
        center: [newLat, newLng]
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

  const handleSearchButtonClick = () => {
    navigate('/suche', { state: { location: selectedLocation } });
  };

  return (
    <div className='profile-body'>
      <div className='homepage-wrapper'>
        <div>
          <section className='homepage-banner'>
            <img src={HomepageBanner} alt="homepage-banner" />
            <div className="banner-content">
              <GoogleMapsWrapper>
                <GooglePlacesAutocomplete
                  apiOptions={{ language: 'de', region: 'de' }}
                  autocompletionRequest={{
                    componentRestrictions: {
                      country: ['de'],
                    }
                  }}
                  selectProps={{
                    value: "test",
                    placeholder: selectedLocation?.address ? selectedLocation.address : "Ort / Postleitzahl",
                    onChange: handleChange,
                    onMenuOpen: () => setSelectedLocation(null),
                    onFocus: () => setSelectedLocation(null),
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
              </GoogleMapsWrapper>

              <button className="save-btn" type="button" onClick={handleSearchButtonClick}>Suche starten</button>
            </div>
          </section>

          <section className='homepage-content'>
            <div className='heading-with-line'>
              <div className="line"></div>
              <h2>Finde den perfekten Tiersitter</h2>
              <div className="line"></div>
            </div>

            <div>

              <div>
                <img src={Home2} alt="homepage-banner" />
                <div>
                  <h3>1. Tiersitter Suchen</h3>
                  <p>Schnell und unkompliziert nach dem idealen Tiersitter suchen. Einfach Anforderungen angeben und so die passenden Ergebnisse in deiner Nähe liefern lassen!</p>
                </div>
              </div>

              <div>
                <img src={Home3} alt="homepage-banner" />
                <div>
                  <h3>2. Aussuchen & Buchen</h3>
                  <p>Tiersitter gefunden? Auf zur Buchungsanfrage! Einfaches Formular ausfüllen und dort individuelle Anforderungen und Wünsche angeben - Fertig!</p>
                </div>
              </div>

              <div>
                <img src={Home4} alt="homepage-banner" />
                <div>
                  <h3>3. Bestätigen & Treffen</h3>
                  <p>Warten Sie auf die Bestätigung des Tiersitters. Ist die Buchung bestätigt, ist alles für dein Tiersitting vorbereitet!</p>
                </div>
              </div>

            </div>
          </section>

          <section className='homepage-content'>
            <div className='heading-with-line'>
              <div className="line"></div>
              <h2>Werde stolzer Tierbetreuer</h2>
              <div className="line"></div>
            </div>
            <div>
              <div>
                <img src={Home5} alt="homepage-banner" />
                <div>
                  <h3>1. Zeige wer du bist</h3>
                  <p>Erstelle dein einzigartiges Profil, hebe deine Dienste und Verfügbarkeit hervor und zeig was dich besonders macht. Dein Profil, dein Schaufenster! lass es für dich sprechen!</p>
                </div>
              </div>
              <div>
                <img src={Home6} alt="homepage-banner" />
                <div>
                  <h3>2. Werde entdeckt</h3>
                  <p>Profil fertig? Dann lehn dich zurück und lass dich von Tierbesitzern finden. Zeig der Welt, dass du bereit bist und lass Kunden zu dir kommen!</p>
                </div>
              </div>
              <div>
                <img src={Home7} alt="homepage-banner" />
                <div>
                  <h3>3. Meistere deine Termine</h3>
                  <p>Nimm Buchungen an, die zu deinem Lebensstil passen.  Gestalte deinen Tiersitting-Kalender so, wie es für dich am besten passt. Wir sind hier, um dich zu unterstützen!</p>
                </div>
              </div>
            </div>
            <div className='heading-with-line'>
              <div className="line"></div>
              <h2>Tritt der Community bei</h2>
              <div className="line"></div>
            </div>

          </section>
          <section className='community-content'>
            <div className='image-container'>
              <div className='image-with-button'>
                <img src={Home8} alt="Quiz" />
                <Link to="/quiz" onClick={() => window.scrollTo(0, 0)}>
                  <button className="homepage-btn">→ Zum Haustierquiz</button>
                </Link>
              </div>
              <div style={{ marginBottom: "2.5rem" }} className='image-with-button'>
                <img src={Home9} alt="Forum" />
                <Link to="/forum" onClick={() => window.scrollTo(0, 0)}>
                  <button className="homepage-btn">→ Zum Forum</button>
                </Link>
              </div>
            </div>
          </section>

        </div >
      </div >
    </div>

  );
}

export default LandingPage;