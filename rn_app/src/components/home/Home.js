import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Text, Image, TouchableOpacity, FlatList, InteractionManager } from 'react-native';
import { colors } from '../common/Styles';
import { connect } from 'react-redux';

import ActsList from '../act/ActsList'
import Dashboard from '../user/Dashboard';
import Feeds from './Feeds'
import TabBar from './TabBar'
import RankList from '../Ranking/RankList'

const width = Dimensions.get('window').width;
class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: '',
            activeScreen: 0,
            activityPopup: false,
            photoPopup: false,
            userPopup: false,
            galleryPopup: false,
            activityId: '',
            userId: '',
            photoId: '',
            galleryId: '',
            opacity: 1
        }
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        let pos = this.props.pg;
        if (this.mounted) {
            if(this.scrollView != null) this.scrollView.scrollTo({ x: pos * width, y: 0, animated: false });
            this.setState({ activeScreen: pos });
            if (pos == 0) this.setState({ opacity: 1 });
        }
    }

    _onLayout = () => {
        let pos = this.props.pg;
        if (this.mounted) {
            if(this.scrollView != null) this.scrollView.scrollTo({ x: pos * width, y: 0, animated: false })
            setTimeout(() => {
                this.setState({ opacity: 1 })
            }, 1);
        }
    }

    navigateTo = (route) => {
        this.props.navTo(route);
    }

    onMomentumScrollEnd = (e) => {
        if (this.mounted) {
            let scrollX = e.nativeEvent.contentOffset.x;
            let pos = Math.round(scrollX / width);
            this.setState({ activeScreen: pos })
            console.log(pos, this.state.activeScreen);
        }
    }

    tabScrollTo = (pos) => {
        if (this.mounted) {
            this.setState({ activeScreen: pos })
            this.props.changePg(pos)
            if(this.scrollView != null) this.scrollView.scrollTo({ x: pos * width, y: 0, animated: true })
        }
    }

    render() {
        return (
            <View style={{ backgroundColor: '#191b20', width: width, height: '100%' }}>
                <ScrollView scrollEnabled={false} ref={ref => this.scrollView = ref} horizontal={true} decelerationRate={0.1} snapToInterval={width} snapToAlignment={"center"} onMomentumScrollEnd={event => this.onMomentumScrollEnd(event)}>
                    <View style={{ width: width * 4, height: '100%', flexDirection: 'row', opacity: this.state.opacity }} onLayout={() => this._onLayout()}>
                        <View style={styles.screen}>
                            <ActsList />
                        </View>
                        <View style={styles.screen}>
                            <Feeds />
                        </View>
                        <View style={styles.screen}>
                            <RankList />
                        </View>
                        <View style={styles.screen}>
                            <Dashboard />
                        </View>
                    </View>
                </ScrollView>
                <View>
                    <TabBar activeScreen={this.state.activeScreen} onScrollClick={(pos) => this.tabScrollTo(pos)} />
                </View>

                {this.state.activityPopup && <View style={styles.popup}>
                    <Text>Activity Popup</Text>
                </View>}

                {this.state.userPopup && <View style={styles.popup}>
                    <Text>Activity Popup</Text>
                </View>}

                {this.state.photoPopup && <View style={styles.popup}>
                    <Text>Activity Popup</Text>
                </View>}

                {this.state.galleryPopup && <View style={styles.popup}>
                    <Text>Activity Popup</Text>
                </View>}
            </View>
        );
    }
}


const styles = {
    screen: {
        width: width
    },
    popup: {
        backgroundColor: '#ccc', flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0
    }
}


function mapStateToProps(state) {
    return {
        pg: state.home.activePage
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg }),
        changePg: (pg) => dispatch({ type: 'SET_ACTIVE_PAGE', pg: pg })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(Home);