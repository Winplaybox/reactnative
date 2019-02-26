const initialState = {
    userId: null
}

export default function user(state = initialState, action) {
    switch (action.type) {
        case 'SET_USER_ID':
            return { ...state, userId: action.id }
        default:
            return state
    }
}