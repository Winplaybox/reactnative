import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platform, Image, Dimensions } from 'react-native';
import { colors, sizes, fonts } from '../common/Styles';

import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

const os = Platform.OS;
const width = Dimensions.get('window').width;

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = { showSearchIcon: true, activeTab: 0 }
    }

    goToPartialScreen = (i) => {
        this.props.onScrollClick(i)
    }

    navigateTo = (route) => {
        this.props.navTo(route);
    }

    render() {
        return (
            <View style={styles.tabsContainer}>

                {/* Acts */}
                <TouchableOpacity style={styles.btn} onPress={() => this.goToPartialScreen(0)}>
                    <Text style={{ ...styles.icon, color: (this.props.activeScreen == 0) ? "#fc4372" : "#7b8191" }}>&#xf073;</Text>
                </TouchableOpacity>

                {/* Feed */}
                <TouchableOpacity style={styles.btn} onPress={() => this.goToPartialScreen(1)}>
                    <Text style={{ ...styles.icon, color: (this.props.activeScreen == 1) ? "#fc4372" : "#7b8191", fontSize: 30 }}>&#xf1ea;</Text>
                </TouchableOpacity>

                {/* Camera */}
                <TouchableOpacity style={styles.btn} onPress={() => this.navigateTo("camera")} style={{ width: 80, height: sizes.headerHeight, position: 'relative', justifyContent: 'center', flexDirection: 'row' }} activeOpacity={0.6}>
                    <View style={{ width: 60, height: 60, marginTop: -20, backgroundColor: "#fc4372", borderRadius: 15, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                        <LinearGradient
                            style={{ ...styles.lg, position: 'absolute', width: 60, height: 60, left: 0, top: 0 }}
                            start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
                            locations={[0.5, 1]}
                            colors={['#fc4372', '#8a325f']}>
                        </LinearGradient>
                        <Text style={{ ...styles.icon, fontFamily: fonts.iconSolid, color: '#fff', fontSize: 30, width: 40 }}>&#xf030;</Text>
                    </View>
                </TouchableOpacity>

                {/* Leaderboard */}
                {<TouchableOpacity style={styles.btn} onPress={() => this.goToPartialScreen(2)}>
                    <Text style={{ ...styles.icon, color: (this.props.activeScreen == 2) ? "#fc4372" : "#7b8191" }}>&#xf521;</Text>
                </TouchableOpacity>}

                {/* Profile */}
                {<TouchableOpacity style={styles.btn} onPress={() => this.goToPartialScreen(3)}>
                    <Text style={{ ...styles.icon, color: (this.props.activeScreen == 3) ? "#fc4372" : "#7b8191", fontSize: 28 }}>&#xf007;</Text>
                </TouchableOpacity>}
            </View>
        );
    }
}

const styles = {
    icon: {
        color: '#7b8191', fontSize: width < 370 ? 24 : 30, fontFamily: 'FontAwesome5ProRegular', textAlign: 'center'
    },
    tabsContainer: {
        backgroundColor: /*colors.color4*/ "#2a2c34", flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: sizes.headerHeight, borderTopLeftRadius: 15, borderTopRightRadius: 15
    },
    btn: {
        height: sizes.headerHeight, width: sizes.headerHeight, alignItems: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center'
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