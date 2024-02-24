import * as settingsAction from './SettingsActions'

function getUser(token, userID) {
    return dispatch => {
        dispatch(settingsAction.getUser(token, userID));
    };
}

function getPublicUser(token, userID) {
    return dispatch => {
        dispatch(settingsAction.getPublicUser(token, userID));
    };
}

function updateUser(token, userBody, userID) {
    return dispatch => {
        dispatch(settingsAction.updateUser(token, userBody, userID));
    };
}

function uploadProfPic(token, pic) {
    return dispatch => {
        dispatch(settingsAction.uploadProfPic(token, pic));
    };
}

function deleteProfPic(token, picID) {
    return dispatch => {
        dispatch(settingsAction.deleteProfPic(token, picID));
    };
}
export {
    getUser,
    updateUser,
    uploadProfPic,
    deleteProfPic,
    getPublicUser
}