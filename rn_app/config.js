export const config = {
    ConfigSettings: {
        uploadsFolder: "https://d9iwkak9g3sxe.cloudfront.net/uploads/images/",
        gqlURI: "http://13.232.85.183:8082/graphql?",
        //gqlURI: "http://192.168.1.23:3000/graphql?",
        serverURI: "http://13.232.85.183:8082/",
        //serverURI: "http://192.168.1.23:3000/"
    }
}

export const getServiceURL = (service) => {
    let env = "beta";
    return (env == "beta") ? config.ConfigSettings[service].betaUrl : config.ConfigSettings[service].url
}