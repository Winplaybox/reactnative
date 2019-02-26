import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platform, Image } from 'react-native';
import { colors, sizes } from './Styles';

import { connect } from 'react-redux';

const os = Platform.OS;

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = { showSearchIcon: true }
    }

    goback = () => {
        this.props.log("goBack")
        this.props.goBack();
    }

    goHome = () => {
        this.props.log("goHome")
        this.props.navTo("HOME");
    }

    logout = () => {
        this.props.logout();
    }

    debug = () => {
        this.props.debug();
    }

    toggleSearch = (show) => {
        this.setState({
            showSearchIcon: show
        });
    }

    getProducts = () => {
        this.props.log('listing page new search by term')
        this.props.onSearch(); // defined in routes.js
    }

    toggleMenu = () => {
        let val = (this.props.menuOpen == 0) ? 1 : 0;
        this.props.toggleMenu(val);
    }

    render() {
        return (
            <View style={styles.header}>
                {/* Back Button */}
                {os == 'ios' && <TouchableOpacity onPress={this.goback}>
                    <Text style={{ ...styles.icon, marginRight: 20 }}>&#xf060;</Text>
                </TouchableOpacity>}

                {/* Menu */}
                <TouchableOpacity onPress={this.toggleMenu} style={{paddingRight: 20}}>
                    <Text style={styles.icon}>&#xf0c9;</Text>
                </TouchableOpacity>

                {/* Page Title */}
                {/* <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'normal', opacity: 0.1, flex: 1, paddingLeft: 20 }}>{this.props.routes.active}</Text> */}

                {/* Home */}
                <TouchableOpacity onPress={this.goHome} style={{flex: 1, alignItems: 'center'}}>
                    {/* <Text style={{ ...styles.icon, marginRight: 20 }}>&#xf015;</Text> */}
                    {/* <Image style={{ width: 100 }} source={require('../../../assets/images/signify-logo.png')} resizeMode="contain" /> */}
                </TouchableOpacity>

                {/* Debug */}
                <TouchableOpacity onPress={this.debug}>
                    <Text style={{ ...styles.icon, marginRight: 20 }}>&#xf718;</Text>
                </TouchableOpacity>

                {/* Search */}
                {this.state.showSearchIcon && <TouchableOpacity onPress={() => this.toggleSearch(false)}>
                    <Text style={{ ...styles.icon, marginRight: 0 }}>&#xf002;</Text>
                </TouchableOpacity>}


                {/* Cancel Search */}
                {!this.state.showSearchIcon && <TouchableOpacity onPress={() => this.toggleSearch(true)}>
                    <Text style={{ ...styles.icon, marginRight: 0, fontSize: 28 }}>&#xf00d;</Text>
                </TouchableOpacity>}

                {/* Logout */}
                {/* <TouchableOpacity onPress={this.logout}>
                    <Text style={styles.icon}>&#xf08b;</Text>
                </TouchableOpacity> */}
            </View>
        );
    }
}

const styles = {
    icon: {
        color: '#fff', fontSize: 24, fontFamily: 'FontAwesome5ProLight', height: sizes.headerHeight, paddingVertical: 18, width: 24, textAlign: 'center'
    },
    header: {
        backgroundColor: colors.color4, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', height: sizes.headerHeight, overflow: 'hidden'
    }
}

function mapStateToProps(state) {
    return {
        routes: state.routes,
        menuOpen: state.ui.menuOpen
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        goBack: () => dispatch({ type: 'BACK' }),
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        logout: () => dispatch({ type: 'SIGN_OUT' }),
        debug: () => dispatch({ type: 'TOGGLE_LOGS' }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg }),
        toggleMenu: (val) => dispatch({ type: 'TOGGLE_MENU', val: val }),
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(Header)