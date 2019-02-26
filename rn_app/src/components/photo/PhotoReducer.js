const initialRouteState = {
    photo_id: ""
}

export default function photos(state = initialRouteState, action) {
    switch (action.type) {
        case 'SHOW_PHOTO_ID':
            return { ...state, photo_id: action.id }
        default:
            return state
    }
}