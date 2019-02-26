const initialState = {
    logs: [{ time: 'Now', msg: 'Testing' }],
    visible: false
};

let getTimestamp = () => {
    let d = new Date();
    return d.toLocaleString();
}

let formatLog = (log) => {
    if (typeof log == "object") {
        return JSON.stringify(log);
    }
    return log;
}

export default function log(state = initialState, action) {
    if (action.type == "RECORD") {
        if(__DEV__){
            if(typeof atob !== 'undefined')
                console.log(action.log);
        }
        
    }
    switch (action.type) {
        case 'RECORD':
            return { ...state, logs: [{ time: getTimestamp(), msg: formatLog(action.log) }, ...state.logs] }
        case 'TOGGLE_LOGS':
            return { ...state, visible: !state.visible }
        default:
            return state
    }
}