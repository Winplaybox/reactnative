export const processResponse = (response) => {
    const statusCode = response.status;
    const data = response.json();

    return Promise.all([statusCode, data]).then(res => ({
        statusCode: res[0],
        data: res[1]
    }));
}

export const gqlOptions = (q, vars = null) => {
    return {
        method: 'POST',
        body: JSON.stringify({
            query: q,
            variables: vars
        }),
        headers: { "accept": "application/json", "content-type": "application/json" }
    }
}

export const gqlFetch = (q) => {
    return {
        method: 'POST',
        body: JSON.stringify({
            query: q,
            variables: null
        }),
        headers: { "accept": "application/json", "content-type": "application/json" }
    }
}