import React from 'react';
import { View, ScrollView, RefreshControl, Dimensions, Text, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { colors, fonts } from '../common/Styles';
import { gqlOptions } from '../../utils/Fetch';
import { config } from './../../../config';

const width = Dimensions.get('window').width;
class ActsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            acts: []
        }
        this.mounted = true;
        //this.graphqlTest();
    }

    componentDidMount() {
        this.props.log(`Acts exist: ${this.props.actsList.length}`)
        if (this.props.actsList.length == 0) {
            this.graphql();
        }
    }

    _onRefresh = () => {
        this.setState({ refreshing: true });
        this.graphql();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    graphql = () => {
        let query = `{ acts { _id, name, time, type, performers { firstName } } }`;
        let fetchOptions = gqlOptions(query);
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    this.props.log(res);
                    this.setState({ refreshing: false })
                    this.props.updateActsList(res.data.acts);
                }
            })
            .catch((error) => {
                this.props.log('error: ' + query);
                this.props.log(error);
            })
            .finally(() => {
                this.props.log('error: ' + query);
                this.props.log('acts loaded');
            });
    }

    graphqlTest = () => {
        let fetchOptions = {
            method: "GET",
            headers: {
                "Accept": "text/html,application/json", "Content-Type": "text/html"
            }
        }
        let uri = `${config.ConfigSettings.serverURI}media/test/route`;
        console.log(uri)
        fetch(uri, fetchOptions)
            .then(res => res.text())
            .then(res => console.log(res))
            .catch((error) => {
                this.props.log(uri);
                this.props.log(error);
            })
            .finally(msg => {
                console.log(msg)
            });
    }

    showActInfo = (id) => {
        console.log(`show act`)
        this.props.showActInfo(id);
        this.props.navTo("act");
    }

    isLive = (t) => {
        let dt = new Date(parseInt(t));
        let cur = new Date();
        let diff = (cur - dt)/1000;
        console.log("islive diff: " + diff)
        if(cur > dt && (diff >= 0 && diff < 600 )) {
            return <View style={{ position: 'absolute', right: 0, top: 0, backgroundColor: '#fc4372', paddingHorizontal: 20, paddingVertical: 5, borderBottomLeftRadius: 10 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Live</Text>
            </View>
        }
        return <View style={{ position: 'absolute', right: 0, top: 0 }}></View>
    }

    render() {
        formatDate = (date) => {
            let n = parseInt(date);
            let d = new Date(n);
            return <Text style={styles.actTime}>Scheduled at {(d.getHours() % 12).toString().padStart(2, "0")}:{d.getMinutes().toString().padStart(2, "0")} {d.getHours() >= 12 ? 'PM' : 'AM'}</Text>
        }

        return (
            <View style={{ flex: 1, paddingHorizontal: 15, paddingBottom: 0 }}>
                <ScrollView style={{ flex: 1, paddingVertical: 15 }} refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                    />
                }>
                    <Text style={{ fontFamily: fonts.galano, color: "#7b8191", marginVertical: 15, fontSize: 30 }}>Activities</Text>
                    {
                        this.props.actsList.length > 0 ?
                            Array.from(this.props.actsList).sort((_a, _b) => parseInt(_a.time) > parseInt(_b.time) ? 1 : -1 ).map((act, k) =>
                                <TouchableOpacity onPress={() => this.showActInfo(act._id)} style={styles.actContainer} key={k + "_"}>
                                    <LinearGradient
                                        style={{ ...styles.lg, position: 'absolute', width: '100%', height: '100%', left: 0, top: 0 }}
                                        start={{ x: 0.5, y: 1 }} end={{ x: 0.8, y: 0.15 }}
                                        locations={[0, 0.3, 1]}
                                        colors={['#363741', '#363741', '#423a3c']}>
                                    </LinearGradient>

                                    <View style={{ padding: 10 }}>

                                        <View style={{ flexDirection: "row", display: 'flex', alignItems: "flex-start" }}>
                                            <Text style={styles.actType}>{act.type.toUpperCase().replace("_", " ")}</Text>
                                            {act.type == "dance_solo" && <Text style={styles.actTypeIcon}>&#xf70c;</Text>}
                                            {act.type == "dance_group" && <Text style={styles.actTypeIcon}>&#xf4ce;</Text>}
                                            {act.type.indexOf("singing") > -1 && <Text style={styles.actTypeIcon}>&#xf130;</Text>}
                                        </View>

                                        <Text style={{ ...styles.actName, fontFamily: "GalanoGrotesqueDEMO-Bold", fontWeight: 'normal' }}>{act.name.toUpperCase()}</Text>
                                        {formatDate(act.time)}
                                        <Text style={{ marginTop: 5, color: '#7b8191', fontWeight: 'bold' }}>PERFORMERS: </Text>
                                        <Text style={{ fontSize: 16, color: '#ea756e' }}>{act.performers.map(x => x.firstName).join(", ")}</Text>
                                    </View>

                                    {this.isLive(act.time)}
                                </TouchableOpacity>
                            )
                            : <View>
                                <Text>Loading acts..</Text>
                            </View>
                    }
                </ScrollView>
            </View>
        );
    }
}

//cf71f2
const styles = {
    actContainer: {
        backgroundColor: "#423a3c", marginBottom: 15, borderRadius: 10, overflow: 'hidden', elevation: 2
    },
    actName: {
        fontSize: 24, fontWeight: "bold", color: "#fff"
    },
    actType: {
        color: "#7b8191", fontWeight: "bold", marginBottom: 5
    },
    actTypeIcon: {
        fontFamily: fonts.iconSolid, color: "#7b8191", lineHeight: 19, fontSize: 14, marginLeft: 5, display: 'none'
    },
    actTime: {
        color: "#fff", marginTop: 1
    }
}


function mapStateToProps(state) {
    return {
        actsList: state.acts.actsList
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        showActInfo: (id) => dispatch({ type: 'SHOW_ACT_INFO', id: id }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg }),
        updateActsList: (data) => dispatch({ type: 'UPDATE_ACTS_LIST', data: data })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(ActsList);