import { combineReducers } from 'redux';
import authenticationReducer from "../react/components/authentication/state/AuthenticationReducer"
import settingsReducer from "../react/components/components/state/SettingsReducer"
import forumReducer from "../react/components/Forum/state/ForumReducer"

const rootReducer = combineReducers({
    authenticationReducer,
    settingsReducer,
    forumReducer
});

export default rootReducer;