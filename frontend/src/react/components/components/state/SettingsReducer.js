import * as settingsActions from './SettingsActions'

const initialState = {
    user: null,
    user_updated: null
}
function settingsReducer(state = initialState, action) {
    switch (action.type) {
        case settingsActions.USER_INFOS_SUCCESS:
            return {
                ...state,
                user: action.user
            }
        case settingsActions.USER_INFOS_ERROR:
            return {
                ...state,
                user: null
            }
        case settingsActions.PUBLIC_USER_INFOS_SUCCESS:
            return {
                ...state,
                public_user: action.public_user
            }
        case settingsActions.UPDATE_USER_SUCCESS:
            return {
                ...state,
                user_updated: true,
                update_error: false
            }
        case settingsActions.UPDATE_USER_ERROR:
            return {
                ...state,
                user_updated: false,
                update_error: true
            }
        case settingsActions.UPDATE_USER_NULL:
            return {
                ...state,
                user_updated: null,
                update_error: null
            }
        case settingsActions.PROFILE_PIC_UPLOAD_SUCCESS:
            return {
                ...state,
                profilePic_updated: true
            }
        case settingsActions.PROFILE_PIC_UPLOAD_FALSE:
            return {
                ...state,
                profilePic_updated: false
            }
        case settingsActions.PROFILE_PIC_DELETE_SUCCESS:
            return {
                ...state,
                profilePic_deleted: true,
                show_modal: false
            }
        case settingsActions.PROFILE_PIC_DELETE_FALSE:
            return {
                ...state,
                profilePic_deleted: false
            }
        case settingsActions.SHOW_MODAL:
            return {
                ...state,
                show_modal: true
            }
        case settingsActions.HIDE_MODAL:
            return {
                ...state,
                show_modal: false
            }
        default:
            return state
    }
}

export default settingsReducer;