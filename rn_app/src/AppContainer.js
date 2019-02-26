import React, { Component } from 'react';
import { View } from 'react-native';
import storage from './utils/Storage';
import Logger from './components/logs/Logger';
import Routes from './Routes';
import { getReport } from './components/analytics/Device'

import { config } from './../config'
import { processResponse } from './utils/Fetch';

import { connect } from 'react-redux';
class AppContainer extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {

        storage.get("analytics", (errmsg, res) => {
            this.props.log("getAnalytics");
            this.props.log(res)
            if (res != null) {
                this.props.log("Analytics loaded");
                this.props.log(res);
            } else {
                getReport((data) => {
                    console.log(data)
                    console.log('fetchedd')
                    let fetchOptions = {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
                    }
                    let uri = `${config.ConfigSettings.serverURI}analytics/share`;

                    fetch(uri, fetchOptions)
                        .then(res => res.text())
                        .then(res => {
                            this.props.log(res);
                            storage.set("analytics", JSON.stringify(data));
                            this.props.log("analytics reported");
                        })
                        .catch((error) => {
                            this.props.log(uri);
                            this.props.log(error);
                        });
                });
            }
        });

        storage.get("user", (errmsg, res) => {
            this.props.log("getuser");
            this.props.log(res)
            if (res != null) {
                this.props.loadUserData(res);
                this.props.log("user loaded");
                this.props.log(res);
                storage.set("user", this.props.activeAccount);
            } else {
                this.props.log(errmsg)
                this.props.log(res)
            }
        });
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Routes />
                <Logger />
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        activeAccount: state.common.activeAccount,
        isReady: state.common.isReady
    }
}

function mapDispatchToProps(dispatch) {
    return {
        loadUserData: (userData) => dispatch({ type: 'LOAD_USER_DATA', userData: userData }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);