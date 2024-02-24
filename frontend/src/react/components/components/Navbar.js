import React, { useState, useEffect } from 'react';
import { Link, Outlet } from "react-router-dom";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { useMediaQuery } from 'react-responsive';

// https://www.flaticon.com/free-icons/close
import menu from '../../../layout/images/menu.png'
// https://icons8.com/icons/set/cancel--static--white
import close from '../../../layout/images/close.png'
import profilePictureDummy from '../../../layout/images/ProfilePictureDummy_white.png'
import Logo from '../../../layout/images/home_logo.png'

import * as authenticationService from "../authentication/state/AuthenticationService";
import * as settingsService from './state/SettingsService'

const Navbar = (props) => {
  const { getPublicUser, public_user, accessToken, cookieCheck, profilePic_updated, profilePic_deleted, logged_in, logout, userID } = props;

  useEffect(() => {
    cookieCheck();
  }, []);

  useEffect(() => {
    if (userID) {
      getPublicUser(accessToken, userID);
    }
  }, [userID, profilePic_updated, profilePic_deleted]);

  const isPhone = useMediaQuery({ maxWidth: 1281 });

  const dispatch = useDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout()
  }

  let img;
  if (logged_in && public_user && public_user.profilePicture) {
    img = <img className='navbar-image' alt='profile pic' src={process.env.REACT_APP_SERVER + "/pictures/" + public_user.profilePicture} />
  } else {
    img = <img className='navbar-image' src={profilePictureDummy} alt='pfp pic' width="50rem" />
  }
  return (
    <>
      {(isPhone && !menuOpened) && <img className='navbar-open-btn' src={menu} width="50" height="50" alt="Open-Icon" onClick={() => setMenuOpened(true)} />}
      <nav className={`navbar ${isPhone ? (menuOpened ? 'show' : 'hide') : 'show'}`}>
        <div className="navbar-container">
          <div className="home">
            <Link to="/" >
              <img className='navbar-logo' src={Logo} width="130" height="50" alt="Home-Logo" />
            </Link>
            {(isPhone && menuOpened) && <img className='navbar-close-btn' src={close} alt="Close-Icon" onClick={() => setMenuOpened(false)} />}
          </div>

          <div className="right-items">
            <div className="nav-element" onClick={() => setMenuOpened(false)}>
              <Link to="/quiz">Quiz</Link>
            </div>
            <div className="nav-element" onClick={() => setMenuOpened(false)}>
              <Link to="/suche">Tiersitter suchen</Link>
            </div>
            <div className="nav-element" onClick={() => setMenuOpened(false)}>
              <Link to="/forum">Forum</Link>
            </div>

            {logged_in && (
              <div className="dropdown">
                <div className="dropdown-btn" onClick={toggleDropdown}>
                  {img}
                </div>
                {dropdownOpen && (
                  <div className="dropdown-content">
                    <Link to={`/profil/${userID}`} onClick={() => setMenuOpened(false)}>Mein Profil</Link>
                    <Link to={`/buchungen`} onClick={() => setMenuOpened(false)}>Buchungen</Link>
                    <Link to={`/myPosts`} onClick={() => setMenuOpened(false)}>Beiträge</Link>
                    <Link to="/settings" onClick={() => setMenuOpened(false)}>Einstellungen</Link>
                    <button className="logout-btn" onClick={() => { handleLogout(); setMenuOpened(false) }}>Ausloggen</button>
                  </div>
                )}
              </div>
            )}

            {!logged_in && (
              <div
                className="login-btn"
                onClick={() => { dispatch({ type: "HIDE_REGISTRATION_SUCCESS" }); setMenuOpened(false) }}
              >
                <Link to="/Login">Einloggen / Registrieren</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

const mapStateToProps = state => {
  return {
    logged_in: state.authenticationReducer.logged_in,
    userID: state.authenticationReducer.userID,
    accessToken: state.authenticationReducer.accessToken,
    profilePic_updated: state.settingsReducer.profilePic_updated,
    profilePic_deleted: state.settingsReducer.profilePic_deleted,
    public_user: state.settingsReducer.public_user
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  logout: authenticationService.logoutAction,
  cookieCheck: authenticationService.cookieCheck,
  getPublicUser: settingsService.getPublicUser
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);