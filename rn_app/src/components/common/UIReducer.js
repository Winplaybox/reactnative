const initialRouteState = {
    menuOpen: 0
}

export default function ui(state = initialRouteState, action) {
    switch (action.type) {
        case 'TOGGLE_MENU':
            return { ...state, menuOpen: action.val }
        default:
            return state
    }
}