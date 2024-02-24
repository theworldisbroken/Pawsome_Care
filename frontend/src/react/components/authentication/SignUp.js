import React, { useState } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { Link } from "react-router-dom";
import "../../../layout/style/loginSignUp.css";
import DogLogo from '../../../layout/images/dog_logo.png'
import emailsent from '../../../layout/images/email-sent.png'
import * as authenticationService from "./state/AuthenticationService";

const SignUp = (props) => {

  const { register, registration_Success, error } = props;

  const [userID, setUserID] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: '',
    hasUpperCase: '',
  });
  const [not_filled, setNot_filled] = useState('');
  const [not_email, setNot_emal] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'userID') {
      setUserID(value);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'firstName') {
      setFirstName(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };
  let userBody = {
    "userID": userID,
    "email": email,
    "firstName": firstName,
    "password": password
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (userID !== '' && email !== '' && firstName !== '' && password !== '') {
      setNot_filled(false)
      const hasMinLength = password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(password);
      if (!hasMinLength) {
        setPasswordValidation({ hasMinLength: false })
      } else if (!hasUpperCase) {
        setPasswordValidation({ hasUpperCase: false })
      } else if (!email.includes('@')) {
        if (hasUpperCase && hasUpperCase) {
          setPasswordValidation({ hasMinLength: true, hasUpperCase: true })
        }
        setNot_emal(true)
      } else if (email.includes('@') && hasUpperCase && hasUpperCase) {
        register(userBody)
        setNot_filled(false)
        setNot_emal(false)
        setPasswordValidation({ hasMinLength: true, hasUpperCase: true })
      }
    } else {
      setNot_filled(true)
    }
  };

  let page;
  if (registration_Success) {
    page =
      <div className="registration-confirmation-wrapper">
        <img className='email-sent-image' alt="sent icon" src={emailsent} />
        <p className='registration-confirm-message'>Sie haben eine Bestätigungsmail bekommen </p>
      </div>
  } else {
    page = <div className="content-box-signup">
      <form>
        <h1>REGISTRIEREN</h1>

        <div className="input-container">
          <input type="text" placeholder="Vorname" name="firstName" onChange={handleChange} required />
        </div>

        {(!not_email && !error) && <div className="input-container">
          <input type="text" value={email} placeholder="E-Mail" name="email" onChange={handleChange} required />
        </div>
        }

        {(not_email || error) && <div className="input-container-error">
          <input type="text" placeholder="E-Mail" value={email} name="email" onChange={handleChange} required />
        </div>}
        {not_email && <p className='signup-error-message'>Geben Sie bitte eine gültige E-Mail </p>}

        <div className="input-container">
          {((passwordValidation.hasMinLength === '' || passwordValidation.hasUpperCase === '') || (passwordValidation.hasMinLength && passwordValidation.hasUpperCase)) &&
            <input type="password" value={password} placeholder="Password" name="password" onChange={handleChange} required />
          }
          {(passwordValidation.hasMinLength === false || passwordValidation.hasUpperCase === false) &&
            <div className="input-container-error">
              <input type="password" value={password} name="password" onChange={handleChange} required />
            </div>
          }
          {passwordValidation.hasMinLength === false &&
            <p className="signup-error-message">Password muss mindestens 8 Zeichen haben</p>
          }
          {passwordValidation.hasUpperCase === false &&
            <p className="signup-error-message">Password muss mindestens einen Großbuchstaben haben</p>
          }
        </div>

        <div className="icon-username">
          <img src={DogLogo} alt="Pawsome Care Logo" />
          {!error && <input type="text" value={userID} placeholder="Wähle einen Benutzernamen" name="userID" onChange={handleChange} required />}
          {error && <div className="input-container-error">
            <input type="text" value={userID} placeholder="Benutzername" name="userID" onChange={handleChange} required />
          </div>}
        </div>

        <button type="submit" onClick={handleSubmit}>Weiter</button>
        {error && <p className='signup-error-message'>Benutzen Sie bitte andere Angaben</p>}
        {not_filled && <p className='signup-error-message'>Bitte füllen Sie alle Felder aus</p>}

        <div className="login">
          Bereits ein Account?{" "}
          <Link to="/login">Hier einloggen</Link>
        </div>
      </form>
    </div>
  }

  return (
    <div className='signup-body'>
      {page}
    </div>
  );
}

const mapStateToProps = state => {
  return {
    registration_Success: state.authenticationReducer.registration_Success,
    error: state.authenticationReducer.error
  };
}

const mapDispatchToProps = dispatch => bindActionCreators({
  register: authenticationService.register
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);