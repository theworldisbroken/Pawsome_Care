import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as settingsService from './state/SettingsService'
import '../../../layout/style/settings.css'

import profilePictureDummy from '../../../layout/images/ProfilePictureDummy.png'
import edit_icon from '../../../layout/images/edit_icon.png'

const Settings = (props) => {

    const { getUser, updateUser, uploadProfPic, show_modal, deleteProfPic, user, profilePic_updated, profilePic_deleted, accessToken, userID, user_updated, update_error } = props;

    const dispatch = useDispatch()

    const [userID1, setUserID1] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordValidation, setPasswordValidation] = useState({
        hasMinLength: '',
        hasUpperCase: '',
    });
    const [pic, setPic] = useState()
    const [edit_info, setEdit_info] = useState(false)
    const [userIDMiss, setUserIDMiss] = useState(false);
    const [emailMiss, setEmailMiss] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'userID1') {
            setUserID1(value);
        } else if (name === 'email') {
            setEmail(value);
        } else if (name === 'firstName') {
            setFirstName(value);
        } else if (name === 'lastName') {
            setLastName(value);
        } else if (name === 'password') {
            setPassword(value);
        }
    };

    useEffect(() => {
        getUser(accessToken, userID);
    }, [accessToken, profilePic_updated, profilePic_deleted]);

    useEffect(() => {
        if (user) {
            setUserID1(user.userID);
            setEmail(user.email);
            setFirstName(user.firstName);
            setLastName(user.lastName);
        }
    }, [user, edit_info]);

    useEffect(() => {
        if (update_error) {
            setEmailMiss(true)
            setUserIDMiss(true)
        }
    }, [update_error]);

    useEffect(() => {
        if (pic) {
            handleUpload()
        }
    }, [pic]);

    let userBody = {
        "userID": userID1,
        "email": email,
        "firstName": firstName,
        "lastName": lastName
    }
    if (password !== "") {
        userBody.password = password;
    }
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const handleSubmit = (e) => {
        e.preventDefault()
        if (userID1 === "") {
            dispatch({ type: "UPDATE_USER_NULL" })
            if (email !== "" && email.includes('@')) {
                setEmailMiss(false)
            } else {
                setEmailMiss(true)
            }
            setUserIDMiss(true)
        } else if (email === "" || !email.includes('@')) {
            dispatch({ type: "UPDATE_USER_NULL" })
            if (userID1 !== "") {
                setUserIDMiss(false)
            }
            setEmailMiss(true)
        } else if (password && (!hasMinLength || !hasUpperCase)) {
            if (!hasMinLength) {
                dispatch({ type: "UPDATE_USER_NULL" })
                setPasswordValidation({ hasMinLength: false })
            } else if (!hasUpperCase) {
                dispatch({ type: "UPDATE_USER_NULL" })
                setPasswordValidation({ hasUpperCase: false })
            } else {
                updateUser(accessToken, userBody, userID)
                if (!update_error) {
                    setUserIDMiss(false)
                    setEmailMiss(false)
                }
                setPasswordValidation({ hasMinLength: true, hasUpperCase: true })
            }
        } else {
            updateUser(accessToken, userBody, userID)
            setPasswordValidation({ hasMinLength: true, hasUpperCase: true })
            if (!update_error) {
                setUserIDMiss(false)
                setEmailMiss(false)
            }
        }
    }

    const handleUpload = () => {
        const formData = new FormData();
        formData.append('profilePic', pic)
        uploadProfPic(accessToken, formData)
        dispatch({ type: "PROFILE_PIC_UPLOAD_FALSE" })
    }

    const handleDelete = () => {
        deleteProfPic(accessToken, user.profilePicture)
        dispatch({ type: "PROFILE_PIC_DELETE_FALSE" })
    }

    if (!user) {
        return <div>Loading..</div>;
    }

    let infos;
    if (edit_info) {
        infos = <>
            {!userIDMiss && <div className="settings-input-container">
                <label className='settings-input-label'>UserID:</label>
                <input type='text' name="userID1" value={userID1 || ''} onChange={handleChange} />
            </div>}
            {userIDMiss && <div className="settings-input-container">
                <label className='settings-input-label'>UserID:</label>
                <input className='settings-userID-missing' type='text' name="userID1" value={userID1 || ''} onChange={handleChange} />
            </div>}
            <p className="settings-logout-msg">Hinweis: Bei Änderung müssen Sie sich neu einloggen</p>
            <hr className='settings-inputs-line' />
            {!emailMiss && <div className="settings-input-container">
                <label className='settings-input-label'>E-Mail:</label>
                <input type='text' name="email" value={email || ''} onChange={handleChange} />
            </div>}
            {emailMiss && <div className="settings-input-container">
                <label className='settings-input-label'>E-Mail:</label>
                <input className='settings-email-missing' type='text' name="email" value={email || ''} onChange={handleChange} />
            </div>}
            <hr className='settings-inputs-line' />
            <div className="settings-input-container">
                <label className='settings-input-label'>First Name:</label>
                <input type='text' name="firstName" value={firstName || ''} onChange={handleChange} />
            </div>
            <hr className='settings-inputs-line' />
            <div className="settings-input-container">
                <label className='settings-input-label'>Last Name:</label>
                <input type='text' name="lastName" value={lastName || ''} onChange={handleChange} />
            </div>
            <hr className='settings-inputs-line' />
            <div className="settings-input-container">
                <label className='settings-input-label'>Password:</label>
                {((passwordValidation.hasMinLength === '' || passwordValidation.hasUpperCase === '') || (passwordValidation.hasMinLength && passwordValidation.hasUpperCase)) &&
                    <input value={password} type='password' placeholder='Geben Sie neues Password ein' name="password" onChange={handleChange} />}
                {(passwordValidation.hasMinLength === false || passwordValidation.hasUpperCase === false) &&
                    < div className="settings-container-error">
                        <input value={password} type='password' placeholder='Geben Sie neues Password ein' name="password" onChange={handleChange} />
                    </div>}
                {passwordValidation.hasMinLength === false &&
                    <p className="settings-error-psw">Mindestens 8 Zeichen sind nötig</p>
                }
                {passwordValidation.hasUpperCase === false &&
                    <p className="settings-error-psw">Ein Großbuchstaben ist nötig</p>
                }
            </div >
            {user_updated && <p className="settings-success-msg">Ihre Daten wurden aktualisiert!</p>
            }
            {update_error && <p className="settings-error-msg">UserID oder E-Mail existiert schon!</p>}
            <div className="settings-buttons-container">
                <button className='settings-btn' type="submit" onClick={() => setEdit_info(false)}>Abbrechen</button>
                <button className='settings-btn' type="submit" onClick={handleSubmit}>Speichern</button>
            </div>
        </>
    } else {
        infos = <>
            <div className="settings-input-container">
                <label className='settings-input-label'>UserID:</label>
                <label className='settings-infos-label'>{user.userID || ''}</label>
            </div>
            <hr className='settings-inputs-line' />
            <div className="settings-input-container">
                <label className='settings-input-label'>E-Mail:</label>
                <label className='settings-infos-label' >{user.email || ''} </label>
            </div>
            <hr className='settings-inputs-line' />
            <div className="settings-input-container">
                <label className='settings-input-label'>First Name:</label>
                <label className='settings-infos-label' >{user.firstName || ''}</label>
            </div>
            <hr className='settings-inputs-line' />
            <div className="settings-input-container">
                <label className='settings-input-label'>Last Name:</label>
                <label className='settings-infos-label' >{user.lastName || ''}</label>
            </div>
            <hr className='settings-inputs-line' />
            <div className="settings-input-container">
                <label className='settings-input-label'>Password:</label>
                <label className='settings-infos-label1' >******</label>
            </div>
        </>
    }

    let img;
    if (user.profilePicture) {
        img = <img className='setting_profilePicture_image' alt='profile pic' src={process.env.REACT_APP_SERVER + "/pictures/" + user.profilePicture} />
    } else {
        img = <img className='setting_profilePicture_image' alt='profile pic' src={profilePictureDummy} />
    }
    return (
        <div className='settings-body'>
            <div className="settings-container">
                <div className={`modal ${show_modal ? 'show' : ''}`}>
                    <div className="modal-content">
                        <h2 className='modal-title'> Profilebild löschen ?</h2>
                        <hr className='modal-hr' />
                        <span className="close" onClick={() => dispatch({ type: 'HIDE_MODAL' })}>&times;</span>
                        <div className="button-container">
                            <button className="button-container-btn-cancel" onClick={() => dispatch({ type: 'HIDE_MODAL' })}>Abbrechen</button>
                            <button className="button-container-btn-confirm" onClick={handleDelete}>Bestätigen</button>
                        </div>
                    </div>
                </div>
                <h1>Einstellungen</h1>
                <div className="settings-pfp">
                    <label className='profPic-label' for="image">
                        <input type="file" name="image" id="image" onChange={(e) => setPic(e.target.files[0])} style={{ display: "none" }} required />
                        {img}
                        <img className='setting_profilePicture_edit-icon' alt='profile icon' src={edit_icon} />
                    </label>
                    {user.profilePicture && <input className='settings-pfp-btn' type="submit" value="Löschen" onClick={() => dispatch({ type: 'SHOW_MODAL' })} />}
                    {!user.profilePicture && <input className='settings-pfp-btn' type="submit" value="Löschen" disabled />}
                </div>
                <hr />
                <h3 className='settings-account-infos'>Account Informationen</h3>
                <div className='settings-wrapper'>
                    <button className='settings-edit-btn' type="submit" name="password" onClick={() => {
                        setEdit_info(!edit_info); dispatch({ type: "UPDATE_USER_NULL" }); setUserIDMiss(false);
                        setEmailMiss(false);
                    }}>Bearbeiten</button>
                    {infos}
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = state => {
    return {
        accessToken: state.authenticationReducer.accessToken,
        userID: state.authenticationReducer.userID,
        user: state.settingsReducer.user,
        user_updated: state.settingsReducer.user_updated,
        update_error: state.settingsReducer.update_error,
        load_error: state.settingsReducer.load_error,
        profilePic_updated: state.settingsReducer.profilePic_updated,
        profilePic_deleted: state.settingsReducer.profilePic_deleted,
        show_modal: state.settingsReducer.show_modal
    };
}

const mapDispatchToProps = dispatch => bindActionCreators({
    getUser: settingsService.getUser,
    updateUser: settingsService.updateUser,
    uploadProfPic: settingsService.uploadProfPic,
    deleteProfPic: settingsService.deleteProfPic
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Settings);