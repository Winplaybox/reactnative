import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, Image, Easing } from 'react-native';
import { colors } from './Styles';
import { connect } from 'react-redux';
import storage from './../../utils/Storage';

const { width, height } = Dimensions.get('window'); 
const animDuration = {
    xl: 600,
    lg: 400,
    md: 250,
    sm: 100
}

class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.sidebarVisibility = new Animated.Value(0);
        this.delayedsidebarVisibility = new Animated.Value(0);
        this.stretchedsidebarVisibility = new Animated.Value(0);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        //console.log('derived state');
        //console.log("next:" + nextProps.menuOpen);
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        //console.log("props :" + this.props.menuOpen)
        if (this.props.menuOpen != prevProps.menuOpen) {
            if (this.props.menuOpen == 1) {
                this.openMenu();
            } else {
                this.closeMenu();
            }
        }
        //console.log("prev:" + prevProps.menuOpen);
    }

    openMenu = () => {
        Animated.parallel([
            Animated.timing(this.sidebarVisibility, { toValue: 1, duration: animDuration.lg, easing: Easing.out(Easing.ease) }),
            Animated.timing(this.delayedsidebarVisibility, { toValue: 1, delay: animDuration.md, duration: animDuration.md }),
            Animated.timing(this.stretchedsidebarVisibility, { toValue: 1, duration: animDuration.lg })
        ]).start();
    }

    closeMenu = () => {
        Animated.parallel([
            Animated.timing(this.sidebarVisibility, { toValue: 0, duration: animDuration.lg, easing: Easing.ease }),
            Animated.timing(this.delayedsidebarVisibility, { toValue: 0, delay: animDuration.md, duration: animDuration.md }),
            Animated.timing(this.stretchedsidebarVisibility, { toValue: 0, duration: animDuration.lg })
        ]).start();

        setTimeout(() => {
            this.props.toggleMenu();
        }, 400);
    }

    goHome = () => {
        this.props.log("goHome from sidebar menu");
        this.closeMenu();
        this.props.navTo("HOME");
    }

    logout = () => {
        storage.remove("user", () => {
            this.props.log("removed user data from storage");
        })
        this.props.logout();
        this.closeMenu();
        this.props.clearHistory();
    }

    navFromSidebar = (route) => {
        this.props.log(`Go to ${route} from sidebar menu`);
        this.closeMenu();
        this.props.navTo(route);
    }


    render() {

        let menuText = ["Home", "My Account", "Previous Catalogs", "View All Products", "Privacy Notice", "Terms of Use", "Logout"];
        menuText = menuText.map(m => m.toLocaleUpperCase());

        let left = this.sidebarVisibility.interpolate({
            inputRange: [0, 1],
            outputRange: [width * -1, 0]
        });
        let scale = this.stretchedsidebarVisibility.interpolate({
            inputRange: [0, 0.75, 1],
            outputRange: [0, 0, 1]
        });
        let rotZ = this.stretchedsidebarVisibility.interpolate({
            inputRange: [0, 0.75, 1],
            outputRange: ["0deg", "0deg", "90deg"]
        });
        let opacity = this.sidebarVisibility.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1]
        });

        return (
            <Animated.View style={{ ...styles.sidebarContainer, left: left, opacity: opacity }}>
                <View style={{ flex: 1 }}>

                    {/* CLOSE MENU */}
                    <View style={{ ...styles.menuButton, justifyContent: 'space-between' }}>
                        {/* <Image style={{ width: 120, height: 40 }} source={require('../../../assets/images/signify-logo.png')} resizeMode="contain" /> */}
                        <TouchableOpacity onPress={() => this.props.toggleMenu()}>
                            <Animated.Text style={{ ...styles.menuItemIcon, fontSize: 36, color: colors.color2, textAlign: "right", transform: [{ scale: scale }, { rotateZ: rotZ }] }}>&#xf00d;</Animated.Text>
                        </TouchableOpacity>
                    </View>

                    {/* HOME */}
                    <TouchableOpacity onPress={() => this.navFromSidebar('Home')} style={styles.menuButton}>
                        <Text style={styles.menuItemIcon}>&#xf015;</Text>
                        <Text style={styles.menuItemText}>{menuText[0]}</Text>
                    </TouchableOpacity>

                    {/* MY ACCOUNT */}
                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuItemIcon}>&#xf406;</Text>
                        <Text style={styles.menuItemText}>{menuText[1]}</Text>
                    </TouchableOpacity>

                    {/* PREVIOUS CATALOGS */}
                    <TouchableOpacity onPress={() => this.navFromSidebar('MarcommListing')} style={styles.menuButton}>
                        <Text style={styles.menuItemIcon}>&#xf1c5;</Text>
                        <Text style={styles.menuItemText}>{menuText[2]}</Text>
                    </TouchableOpacity>

                    {/* VIEW ALL PRODUCTS */}
                    <TouchableOpacity onPress={() => this.navFromSidebar('ProductListing')} style={styles.menuButton}>
                        <Text style={styles.menuItemIcon}>&#xf00b;</Text>
                        <Text style={styles.menuItemText}>{menuText[3]}</Text>
                    </TouchableOpacity>

                    {/* PRIVACY NOTICE */}
                    <TouchableOpacity onPress={() => this.navFromSidebar('PrivacyNotice')} style={styles.menuButton}>
                        <Text style={styles.menuItemIcon}>&#xf21b;</Text>
                        <Text style={styles.menuItemText}>{menuText[4]}</Text>
                    </TouchableOpacity>

                    {/* TERMS OF USE */}
                    <TouchableOpacity onPress={() => this.navFromSidebar('TermsOfUse')} style={styles.menuButton}>
                        <Text style={styles.menuItemIcon}>&#xf621;</Text>
                        <Text style={styles.menuItemText}>{menuText[5]}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ ...styles.menuButton, flex: 1 }}>
                    </TouchableOpacity>

                    {/* LOGOUT */}
                    <TouchableOpacity onPress={this.logout} style={styles.menuButton}>
                        <Text style={{ ...styles.menuItemIcon, fontSize: 20, color: colors.color5 }}>&#xf08b;</Text>
                        <Text style={{ ...styles.menuItemText, fontWeight: 'bold', fontSize: 16, color: colors.color5 }}>{menuText[6]}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    }
}

const styles = {
    sidebarContainer: {
        backgroundColor: '#3c3c41', padding: 15, flexDirection: 'column', position: 'absolute', top: 0, width: width, height: height
    },
    menuButton: {
        flexDirection: 'row', height: 60, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: "#333", transform: [{ translateX: 0 }]
    },
    menuItemText: {
        marginLeft: 15, fontSize: 18, fontWeight: 'bold', color: colors.color5
    },
    menuItemIcon: {
        color: colors.color2, fontSize: 24, fontFamily: 'FontAwesome5ProSolid', width: 24, textAlign: 'center'
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
        log: (msg) => dispatch({ type: 'RECORD', log: msg }),
        toggleMenu: () => dispatch({ type: 'TOGGLE_MENU', val: 0 }),
        clearHistory: () => dispatch({ type: 'CLEAR_NAV_HISTORY' })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(Sidebar)