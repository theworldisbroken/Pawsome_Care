import { jwtDecode } from 'jwt-decode'
import Cookies from 'universal-cookie';

export const REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS'
export const REGISTRATION_ERROR = 'REGISTRATION_ERROR'
export const HIDE_REGISTRATION_SUCCESS = 'HIDE_REGISTRATION_SUCCESS'

export const AUTHENTICATION_PENDING = 'AUTHENTICATION_PENDING';
export const AUTHENTICATION_SUCCESS = 'AUTHENTICATION_SUCCESS'
export const AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'
export const LOGOUT = 'LOGOUT'

export const VERIFICATION_SUCCESS = 'VERIFICATION_SUCCESS'
export const VERIFICATION_ERROR = 'VERIFICATION_ERROR'


const cookies = new Cookies();

export function cookieCheck() {
    return dispatch => {
        const token = cookies.get('token')
        if (token) {
            const decodedToken = jwtDecode(token);
            let userSession = {
                logged_in: "Token gültig",
                user_mongoID: decodedToken.id,
                userID: decodedToken.userID,
                accessToken: token,
                isAdministrator: decodedToken.isAdministrator,
                isVerified: decodedToken.isVerified
            }
            dispatch(getAuthenticationSuccessSAction(userSession));
        }
    }
};

export function getAuthenticationPendingAction() {
    return {
        type: AUTHENTICATION_PENDING
    }
}

export function getAuthenticationSuccessSAction(userSession) {
    return {
        type: AUTHENTICATION_SUCCESS,
        logged_in: userSession.logged_in,
        user_mongoID: userSession.user_mongoID,
        userID: userSession.userID,
        accessToken: userSession.accessToken,
        isAdministrator: userSession.isAdministrator,
        isVerified: userSession.isVerified,
        profilePicture: userSession.profilePicture
    }
}

export function getAuthenticationErrorgAction(error) {
    return {
        type: AUTHENTICATION_ERROR,
        error: error
    }
}

export function authenticateUser(userID, password) {
    return dispatch => {
        dispatch(getAuthenticationPendingAction());
        login(userID, password)
            .then(
                userSession => {
                    const action = getAuthenticationSuccessSAction(userSession);
                    dispatch(action);
                },
                err => {
                    dispatch(getAuthenticationErrorgAction(err))
                }
            ).catch(err => {
                dispatch(getAuthenticationErrorgAction(err))
            })
    }
}

function login(userID, password) {
    const credentials = btoa(userID + ':' + password);
    const requestOptions = {
        method: 'GET',
        headers: { Authorization: 'Basic ' + credentials }
    };
    return fetch(process.env.REACT_APP_SERVER + '/authenticate', requestOptions)
        .then(handleResponse)
        .then(userSession => {
            return userSession
        });
}

function handleResponse(response) {
    const authorizationHeader = response.headers.get('Authorization');

    return response.text().then(text => {
        const data = text && JSON.parse(text);
        let token
        if (authorizationHeader) {
            token = authorizationHeader.split(" ")[1];
        }
        if (!response.ok) {
            if (response.status === 401) {
                getLogoutAction();
            }
            const error = { data } || response.statusText;
            return Promise.reject(error)
        } else {
            const expirationTimeInSeconds = 100 * 60;
            const expirationDate = new Date(Date.now() + expirationTimeInSeconds * 1000);
            cookies.set('token', token, { expires: expirationDate });
            const decodedToken = jwtDecode(token);
            let userSession = {
                logged_in: data,
                user_mongoID: decodedToken.id,
                userID: decodedToken.userID,
                accessToken: token,
                isAdministrator: decodedToken.isAdministrator,
                isVerified: decodedToken.isVerified
            }
            return userSession
        }
    });
}

export function getLogoutAction() {
    return (dispatch) => {
        cookies.remove('token')
        dispatch(logoutAction());
    }
}

export function logoutAction() {
    return {
        type: LOGOUT
    }
}

export function getVerificationSuccessAction() {
    return {
        type: VERIFICATION_SUCCESS
    }
}

export function getVerificationErrorgAction() {
    return {
        type: VERIFICATION_ERROR
    }
}

export function verifyLink(linkEnding) {
    return (dispatch) => {
        const requestOptions = {
            method: 'GET'
        };

        return fetch(process.env.REACT_APP_SERVER + '/activation/' + linkEnding, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response)
                }
                dispatch(getVerificationSuccessAction());
            })
            .catch(() => {
                dispatch(getVerificationErrorgAction());
            });
    }
};

export function getRegistrationSuccessAction() {
    return {
        type: REGISTRATION_SUCCESS
    }
}

export function getRegistrationrrorgAction() {
    return {
        type: REGISTRATION_ERROR
    }
}

export function register(userData) {
    return (dispatch) => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        };

        return fetch(process.env.REACT_APP_SERVER + '/users', requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response)
                }
                dispatch(getRegistrationSuccessAction());
            })
            .catch(() => {
                dispatch(getRegistrationrrorgAction());
            });
    }
};