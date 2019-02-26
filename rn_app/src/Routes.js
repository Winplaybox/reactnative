import React, { Component } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import storage from './utils/Storage';

// import pages/components
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import Login from './components/login/Login';
import Home from './components/home/Home';
import Act from './components/act/Act';
import Photo from './components/photo/Photo';
import Camera from './components/camera/Camera';
import Comments from './components/photo/Comments';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const animDuration = {
    xl: 600,
    lg: 400,
    md: 250,
    sm: 100
}

class Router extends Component {
    menuOpen = new Animated.Value(0);
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    // static getDerivedStateFromProps(nextProps, prevState) {
    //     console.log('derived state');
    //     console.log("next:" + nextProps.menuOpen);
    //     return null;
    // }

    // componentDidUpdate(prevProps, prevState) {
    //     console.log("props :" + this.props.menuOpen)
    //     if (this.props.menuOpen != prevProps.menuOpen) {
    //         if (this.props.menuOpen == 1) {
    //             this.openMenu();
    //         } else {
    //             this.closeMenu();
    //         }
    //     }
    //     console.log("prev:" + prevProps.menuOpen);
    // }

    routesConfig = {

    }

    openMenu = () => {
        console.log("open menu anim");
        Animated.parallel([
            Animated.timing(this.menuOpen, { toValue: 1, duration: animDuration.md })
        ]).start();
    }

    closeMenu = () => {
        console.log("close menu anim");
        Animated.parallel([
            Animated.timing(this.menuOpen, { toValue: 0, duration: animDuration.md })
        ]).start();
    }

    loginData = (data) => {
        this.props.log('logged in save to storage');
        storage.set("user", this.props.common.activeAccount)
    }

    handleBackPress = () => {
        let historyStackLength = this.props.history.length;
        this.props.log(`hardware back. history stack length:${historyStackLength}`);
        if (historyStackLength > 0) {
            this.props.goBack();
            return true;
        }
        return false;
    }


    getComponent = (componentName) => {
        //this.props.log("Routing to component:" + componentName)
        let includeHeader = true;
        let RoutedComponent = <Home />;

        switch (componentName) {
            case 'camera': {
                RoutedComponent = <Camera/>
                break;
            }
            case 'photo': {
                RoutedComponent = <Photo/>
                break;
            }
            case 'comments': {
                RoutedComponent = <Comments/>
                break;
            }
            case 'act': {
                RoutedComponent = <Act/>
                break;
            }
            default: {
                RoutedComponent = <Home />;
                break;
            }
        }

        return <View style={{ flex: 1 }}>
            {/* {includeHeader == true && <Header onSearch={this.getProducts} />} */}
            <View style={{ flex: 1 }}>
                {RoutedComponent}
            </View>
            {/* {includeHeader == true && <Sidebar />} */}
        </View>
    }

    loggedIn = true;

    render() {

        if (this.props.common.activeAccount != null) {
            return (
                <View style={{ backgroundColor: '#000', flex: 1 }}>
                    <Animated.View style={{ flex: 1, backgroundColor: '#f5f8fb', borderRadius: 5, overflow: 'hidden' }}>
                        {this.getComponent(this.props.routes.active)}
                    </Animated.View>
                </View>
            )
        } else {
            return <Login onlogin={this.loginData} />
        }
    }
}

function mapStateToProps(state) {
    return {
        common: state.common,
        routes: state.routes,
        tokens: state.tokens,
        menuOpen: state.ui.menuOpen,
        history: state.routes.history
    }
}

function mapDispatchToProps(dispatch) {
    return {
        goBack: () => dispatch({ type: 'BACK' }),
        routeChange: (routeName) => dispatch({ type: "NAVIGATE_TO", route: routeName }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Router);