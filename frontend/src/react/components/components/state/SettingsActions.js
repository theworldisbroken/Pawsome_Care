import * as authenticationActions from '../../authentication/state/AuthenticationActions'

export const USER_INFOS_SUCCESS = 'USER_INFOS_SUCCESS'
export const USER_INFOS_ERROR = 'USER_INFOS_ERROR'

export const PUBLIC_USER_INFOS_SUCCESS = 'PUBLIC_USER_INFOS_SUCCESS'

export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS'
export const UPDATE_USER_ERROR = 'UPDATE_USER_ERROR'
export const UPDATE_USER_NULL = 'UPDATE_USER_NULL'

export const PROFILE_PIC_UPLOAD_SUCCESS = 'PROFILE_PIC_UPLOAD_SUCCESS'
export const PROFILE_PIC_UPLOAD_FALSE = 'PROFILE_PIC_UPLOAD_FALSE'

export const PROFILE_PIC_DELETE_SUCCESS = 'PROFILE_PIC_DELETE_SUCCESS'
export const PROFILE_PIC_DELETE_FALSE = 'PROFILE_PIC_DELETE_FALSE'

export const SHOW_MODAL = 'SHOW_MODAL'
export const HIDE_MODAL = 'HIDE_MODAL'

export function getUserSuccessAction(user) {
    return {
        type: USER_INFOS_SUCCESS,
        user: user
    }
}

export function getUserErrorgAction() {
    return {
        type: USER_INFOS_ERROR
    }
}

export function getPublicUserSuccessAction(user) {
    return {
        type: PUBLIC_USER_INFOS_SUCCESS,
        public_user: user
    }
}

export function getUserUpdateSuccessAction() {
    return {
        type: UPDATE_USER_SUCCESS,
    }
}

export function getUserUpdaterrorgAction() {
    return {
        type: UPDATE_USER_ERROR
    }
}

export function getProfilePicUploadSuccessAction() {
    return {
        type: PROFILE_PIC_UPLOAD_SUCCESS,
    }
}

export function getProfilePicUploadFalseAction() {
    return {
        type: PROFILE_PIC_UPLOAD_FALSE
    }
}

export function getProfilePicDeleteSuccessAction() {
    return {
        type: PROFILE_PIC_DELETE_SUCCESS,
    }
}

export function getProfilePicDeleteFalseAction() {
    return {
        type: PROFILE_PIC_DELETE_FALSE
    }
}

export function getHideModal() {
    return {
        type: SHOW_MODAL
    }
}

export function getUser(token, userID) {
    return (dispatch) => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        };
        return fetch(process.env.REACT_APP_SERVER + '/users/' + userID, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response)
                }
                return response.text();
            })
            .then((text) => {
                const data = text && JSON.parse(text);
                dispatch(getUserSuccessAction(data));
            })
            .catch(() => {
                dispatch(getUserErrorgAction());
            });
    }
};

export function getPublicUser(token, userID) {
    return (dispatch) => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        };
        return fetch(process.env.REACT_APP_SERVER + '/users/user/' + userID, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response)
                }
                return response.text();
            })
            .then((text) => {
                const data = text && JSON.parse(text);
                dispatch(getPublicUserSuccessAction(data));
            })
            .catch(() => {
            });
    }
};

export function updateUser(token, userBody, userID) {
    return (dispatch) => {
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userBody)
        };
        return fetch(process.env.REACT_APP_SERVER + '/users/' + userID, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response)
                }
                if (userID !== userBody.userID) {
                    dispatch(authenticationActions.getLogoutAction())
                }
                dispatch(getUserUpdateSuccessAction());
            })
            .catch((err) => {
                dispatch(getUserUpdaterrorgAction());
            });
    }
};

export function uploadProfPic(token, pic) {
    return (dispatch) => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            body: pic
        };
        return fetch(process.env.REACT_APP_SERVER + '/pictures/uploadProfilePicture', requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response)
                }
                dispatch(getProfilePicUploadSuccessAction())
            })
            .catch(() => {
                dispatch(getProfilePicUploadFalseAction())
            });
    }
};

export function deleteProfPic(token, picID) {
    return (dispatch) => {
        const requestOptions = {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        };
        return fetch(process.env.REACT_APP_SERVER + '/pictures/profilePicture/' + picID, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response)
                }
                dispatch(getProfilePicDeleteSuccessAction())
            })
            .catch(() => {
                dispatch(getProfilePicDeleteFalseAction())
            });
    }
};