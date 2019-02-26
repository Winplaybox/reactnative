import { AsyncStorage } from "react-native";

function isExpired (_date) {
    let expiryTime = 22 * 60 * 60 * 1000; // 22 hours
    //expiryTime = 1;
    var currTime = new Date();
    var oldTime = new Date(_date);
    var diff = currTime - oldTime;
    return diff >= expiryTime;
}

module.exports = {
    set: async (key, val, success) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify({ val: val, dt: new Date() }), (res) => {
                if (typeof success == "function") success(res);
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    },
    get: async function (key, callback, removeExpired) {
        try {
            value = await AsyncStorage.getItem(key, (err, res) => {
                if(res == null) {
                    callback(err, res);
                } else {
                    res = JSON.parse(res);
                    if (isExpired(res.dt) && removeExpired) {
                        this.remove(key, () => {});
                        callback("Expired", null);
                    } else {
                        callback(err, res.val);
                    }
                }
            });
        } catch (error) {
            console.log(error);
            callback(error, null);
        }
    },
    remove: async (key, callback) => {
        await AsyncStorage.removeItem(key, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("removed: " + key);
                callback();
            }
        });
    },
    clear: async (callback) => {
        
        debugger;
        await AsyncStorage.clear((err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("removed all" );
                callback();
            }
        });
    }
}