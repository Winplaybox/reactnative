import { combineReducers } from 'redux';
import home from './home/HomeReducer';
import ui from './common/UIReducer';
import log from './logs/LogReducer';
import acts from './act/ActReducer';
import photos from './photo/PhotoReducer';
import ranks from './Ranking/RankReducer';

const initialState = {
    count: 0,
    isReady: false,
    activeAccount: null,
    myUserData: []
}

function common(state = initialState, action) {
    switch (action.type) {
        case 'TOKENS_GENERATED':
            return { ...state, isReady: true }
        case 'LOAD_USER_DATA':
            return { ...state, activeAccount: action.userData }
        case 'LOAD_MY_USER_DATA':
            return { ...state, myUserData: action.userData }
        case 'DELETE_PHOTO_FROM_USERDATA': {
            let userdata = [...state.myUserData];
            //userdata[0];
            //feed.splice(len - action.index - 1, 1)
            return { ...state }
        }
        case 'SIGN_IN_USER':
            return { ...state, activeAccount: action.userData }
        case 'SIGN_OUT':
            return {
                ...state, activeAccount: null
            }
        default:
            return state
    }
}




const initialRouteState = {
    active: 'home',
    history: ['home']
}

function routes(state = initialRouteState, action) {
    console.log(action);
    switch (action.type) {
        case 'NAVIGATE_TO':
            return { ...state, history: [...state.history, state.active], active: action.route }
        case 'CLEAR_NAV_HISTORY':
            return { active: 'home', history: ['home'] }
        case 'BACK':
            //if (state.history.length > 1) {
                let newState = { ...state };
                let active = newState.history.pop();
                return { ...newState, active: active }
            // } else {
            //     return state;
            // }
        default:
            return state
    }
}

export default combineReducers({
    log,
    routes,
    ui,
    common,
    home,
    acts,
    photos,
    ranks
})