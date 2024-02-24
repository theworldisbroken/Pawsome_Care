import * as authenticationActions from './AuthenticationActions'

const initialState = {
    user: null,
    accessToken: null,
    pending: false,
    showLoginDialog: false,
    error: false
}
function authenticationReducer(state = initialState, action) {
    switch (action.type) {
        case authenticationActions.AUTHENTICATION_PENDING:
            return {
                ...state,
                pending: true,
                error: false
            }
        case authenticationActions.AUTHENTICATION_SUCCESS:
            return {
                ...state,
                pending: false,
                user_mongoID: action.user_mongoID,
                userID: action.userID,
                logged_in: action.logged_in,
                user_mongoID: action.user_mongoID,
                userID: action.userID,
                accessToken: action.accessToken,
                isAdministrator: action.isAdministrator,
                isVerified: action.isVerified
            }
        case authenticationActions.AUTHENTICATION_ERROR:
            return {
                ...state,
                pending: false,
                error: true
            }
        case authenticationActions.LOGOUT:
            return {
                ...state,
                logged_in: null,
                accessToken: null
            }
        case authenticationActions.VERIFICATION_SUCCESS:
            return{
                ...state,
                verification_Success: true,
                error: false
            }
        case authenticationActions.VERIFICATION_ERROR:
            return{
                ...state,
                verification_Success: false,
                error: true
            }
        case authenticationActions.REGISTRATION_SUCCESS:
            return{
                ...state,
                registration_Success: true,
                error: false
            }
        case authenticationActions.REGISTRATION_ERROR:
            return{
                ...state,
                registration_Success: false,
                error: true
            }
        case authenticationActions.HIDE_REGISTRATION_SUCCESS:
            return{
                ...state,
                registration_Success: false,
                error: false
            }
        default:
            return state
    }
}

export default authenticationReducer;