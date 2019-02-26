const initialState = {
    feed: [],
    activePage: 0,
    feedsOffsetY: 0,
    feedsCount: 10,
    actsOffsetY: 0
}

export default function home(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_FEED_DATA':
            return { ...state, feed: action.data }
        case 'DELETE_PHOTO': {
            let feed = [...state.feed];
            let len = feed.length;
            feed.splice(len - action.index - 1, 1)
            return { ...state, feed: feed }
        }
        case 'SET_ACTIVE_PAGE': {
            return { ...state, activePage: action.pg }
        }
        case 'SET_FEEDS_OFFSET_Y': {
            return { ...state, feedsOffsetY: action.y }
        }
        case 'SET_ACTS_OFFSET_Y': {
            return { ...state, feedsOffsetY: action.y }
        }
        case 'SET_FEEDS_COUNT': {
            return { ...state, feedsCount: action.count }
        }
        default:
            return state;
    }
}