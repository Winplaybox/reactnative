const initialRouteState = {
    rank_id: ""
}

export default function ranks(state = initialRouteState, action) {
    switch (action.type) {
        case 'SHOW_RANK_ID':
            return { ...state, rank_id: action.id }
        default:
            return state
    }
}