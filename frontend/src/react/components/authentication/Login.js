import React, { useState } from 'react';
import { bindActionCreators } from "redux";
import { connect } from 'react-redux'
import { Link } from "react-router-dom";
import "../../../layout/style/loginSignUp.css";

import * as authenticationService from "./state/AuthenticationService";

const Login = (props) => {
  const { authenticationAction, error, pending } = props;
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'userID') {
      setUserID(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    authenticationAction(userID, password);
  };

  return (
    <div className='login-body'>
      <div className="content-box-login">
        <form >
          <h1>EINLOGGEN</h1>
          <div className="input-container">
            <input type="text" placeholder="E-Mail oder Benutzername" name="userID" onChange={handleChange} required />
          </div>

          <div className="input-container">
            <input type="password" placeholder="Passwort" name="password" onChange={handleChange} required />
          </div>
          <button type="submit" onClick={handleSubmit}>Weiter</button>
          {pending && <p className='pending_message'>Wird geladen...</p>}
          {error && <p className='login_error'>Ungültige Eingaben!</p>}
          <div className="signin">
            Noch kein Account?{" "}
            <Link to="/signup">Jetzt registrieren</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    pending: state.authenticationReducer.pending,
    error: state.authenticationReducer.error
  };
}

const mapDispatchToProps = dispatch => bindActionCreators({
  authenticationAction: authenticationService.submitAuthentication
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Login);