const initialRouteState = {
    act_id: "",
    actsList: []
}

export default function acts(state = initialRouteState, action) {
    switch (action.type) {
        case 'SHOW_ACT_INFO':
            return { ...state, act_id: action.id }
        case 'UPDATE_ACTS_LIST':
            return { ...state, actsList: action.data }
        default:
            return state
    }
}