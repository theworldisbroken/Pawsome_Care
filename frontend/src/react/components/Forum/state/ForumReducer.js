import * as forumActions from "./ForumActions"

const initialState = {
}
function forumReducer(state = initialState, action) {
    switch (action.type) {
        case forumActions.POSTS_SUCCESS:
            return {
                ...state,
                posts: action.payload.posts,
                totalposts: action.payload.totalposts
            }
        case forumActions.CREATE_TRUE:
            return {
                ...state,
                create_success: true
            }
        case forumActions.CREATE_FALSE:
            return {
                ...state,
                create_success: false
            }
        case forumActions.UPDATE_POST_TRUE:
            return {
                ...state,
                update_post_success: true
            }
        case forumActions.UPDATE_POST_FALSE:
            return {
                ...state,
                update_post_success: false
            }
        case forumActions.DELETED_POST_TRUE:
            return {
                ...state,
                post_deleted: true
            }
        case forumActions.DELETED_POST_FALSE:
            return {
                ...state,
                post_deleted: false
            }
        case forumActions.POST_EDIT_TRUE:
            return {
                ...state,
                post_edit: true
            }
        case forumActions.POST_EDIT_FALSE:
            return {
                ...state,
                post_edit: false
            }
        case forumActions.TOPIC_CATEGORY:
            return {
                ...state,
                topic_category: action.payload
            }
        default:
            return state
    }
}

export default forumReducer;