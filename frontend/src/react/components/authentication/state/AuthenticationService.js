import * as authenticationActions from './AuthenticationActions'

function submitAuthentication(userID, password) {
    return dispatch => {
        dispatch(authenticationActions.authenticateUser(userID, password));
    };
}

function logoutAction() {
    return dispatch => {
        dispatch(authenticationActions.getLogoutAction());
    };
}

function cookieCheck() {
    return dispatch => {
        dispatch(authenticationActions.cookieCheck());
    };
}

function verifyLink(linkEnding) {
    return dispatch => {
        dispatch(authenticationActions.verifyLink(linkEnding));
    };
}

function register(userData) {
    return dispatch => {
        dispatch(authenticationActions.register(userData));
    };
}

export {
    submitAuthentication,
    logoutAction, 
    verifyLink,
    cookieCheck,
    register
}