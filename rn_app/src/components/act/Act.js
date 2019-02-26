import React from 'react';
import { View, ScrollView, Dimensions, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { config } from './../../../config';

import { colors, fonts } from '../common/Styles';
import { gqlOptions, gqlURI } from '../../utils/Fetch';

import Avatar from './../user/Avatar';

const width = Dimensions.get('window').width;
const actType = {
    singing_group: "Group Singing",
    singing_solo: "Solo Singing",
    dance_solo: "Solo Dance",
    dance_group: "Group Dance",
    comedy_standup: "Standup Comedy",
    comedy_mimicry: "Mimcry",
    skit: "Skit",
    live_band: "Live Band",
    fashion_show: "Fashion Show"
}
class Act extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rating: 0,
            ratingSubmitted: false,
            act: []
        }
        this.mounted = true;
        this.graphql();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    graphql = () => {
        let query = `
        { 
            acts(id: "${this.props.act_id}") { 
                name, time, type, desc, _id, 
                ratings { user_id, rating }
                media {
                    name, _id
                }
                performers {
                    firstName, lastName, gender, avatar
                }
            } 
        }`;
        console.log('act query: ' + query)
        let fetchOptions = gqlOptions(query);

        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    this.props.log(res);
                    this.setState({ act: res.data.acts })
                    this.props.log(this.state.act)
                }
            })
            .catch((error) => {
                this.props.log(`error in: ${query}`);
                this.props.log(error);
            });
    }

    submitRating = (id) => {
        let query = `
        mutation {
            addRating (user_id:"${this.props.activeAccount.emp_id}" act_id:"${id}" rating: ${this.state.rating}) {
                rating
            }
        }`;
        console.log('act query: ' + query)
        let fetchOptions = gqlOptions(query);

        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    this.props.log(res);
                    this.setState({
                        ratingSubmitted: true
                    })
                }
            })
            .catch((error) => {
                this.props.log(uri);
                this.props.log(error);
            });
    }

    navigateTo = (route) => {
        this.props.navTo(route);
    }

    showActInfo = (id) => {
        this.props.showActInfo(id)
    }

    setPhotoId = (id) => {
        this.props.setPhotoId(id)
        this.props.navTo("photo");
    }

    render() {
        formatDate = (date) => {
            let n = parseInt(date);
            let d = new Date(n);
            return <Text style={styles.detailText}>{d.toLocaleString('en-US', { day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric', hour12: true })}</Text>
        }

        return (
            <View style={{ backgroundColor: colors.color5, flex: 1, padding: 15 }}>
                {
                    this.state.act.length > 0 ?
                        this.state.act.map((act, k) =>
                            <ScrollView style={styles.actContainer} key={k}>
                                <Text style={styles.actName}>{act.name}</Text>

                                {act.ratings.filter(a => a.user_id == this.props.activeAccount.emp_id).length == 0 && !this.state.ratingSubmitted &&
                                    <View style={styles.detailBox}>
                                        <View style={{ flexDirection: "row", justifyContent: 'space-between', marginBottom: 20 }}>
                                            {new Array(10).fill(0).map((r, i) => <TouchableOpacity onPress={() => this.setState({ rating: i + 1 })} key={i}>
                                                <Text style={{ color: 'gold', fontSize: width < 380 ? 22 : 28, fontFamily: this.state.rating > i ? fonts.iconSolid : fonts.iconLight }}>&#xf005;</Text>
                                            </TouchableOpacity>)}
                                        </View>

                                        <TouchableOpacity onPress={() => this.submitRating(act._id)} style={styles.rateBtn}>
                                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Submit Rating</Text>
                                        </TouchableOpacity>
                                    </View>}

                                {act.ratings.filter(a => a.user_id == this.props.activeAccount.emp_id).length == 0 && this.state.ratingSubmitted &&
                                    <View style={styles.detailBox}>
                                        <Text style={styles.label}>Your rated this act {this.state.rating}/10</Text>
                                        <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: 10 }}>
                                            {new Array(10).fill(0).map((ro, i1) => <View key={i1}>
                                                <Text style={{ color: 'gold', fontSize: width < 380 ? 22 : 28, fontFamily: this.state.rating > i1 ? fonts.iconSolid : fonts.iconLight }}>&#xf005;</Text>
                                            </View>)}
                                        </View>
                                    </View>}

                                {act.ratings.filter(a => a.user_id == this.props.activeAccount.emp_id).map((r, i) => <View key={i} style={styles.detailBox}>
                                    <Text style={styles.label}>Your rated this act {r.rating}/10</Text>
                                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: 10 }}>
                                        {new Array(10).fill(0).map((ro, i1) => <View key={i1}>
                                            <Text style={{ color: 'gold', fontSize: width < 380 ? 22 : 28, fontFamily: r.rating > i1 ? fonts.iconSolid : fonts.iconLight }}>&#xf005;</Text>
                                        </View>)}
                                    </View>
                                </View>)}

                                <View style={styles.detailBox}>
                                    <Text style={styles.detailText}>{act.desc}</Text>
                                </View>

                                <View style={styles.detailBox}>
                                    <Text style={styles.label}>Act Type</Text>
                                    <Text style={styles.detailText}>{actType[act.type]}</Text>
                                </View>

                                <View style={styles.detailBox}>
                                    <Text style={styles.label}>Date and Time</Text>
                                    {formatDate(act.time)}
                                </View>

                                <View style={styles.detailBox}>
                                    <Text style={styles.label}>Performers</Text>
                                    <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
                                        {act.performers.map((p, i) =>
                                            <View key={i} style={{ width: '25%', alignItems: "center", justifyContent: 'center', display: "flex", marginBottom: 10 }}>
                                                <View style={{ width: 70, height: 70, borderRadius: 100, borderWidth: 3, borderColor: colors.color4, overflow: 'hidden' }}>
                                                    <Avatar gender={p.gender || ''} config={p.avatar || ''} bg={colors.color6} />
                                                </View>
                                                <Text style={{ ...styles.detailText, fontSize: 14, paddingHorizontal: 10, marginTop: 7, textAlign: 'center', color: colors.color6 }}>{p.firstName} {p.lastName}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {act.media.length > 0 && <View style={styles.detailBox}>
                                    <Text style={styles.label}>Photos ({act.media.length})</Text>
                                    {act.media.map((m,kimg) => <TouchableOpacity key={kimg} onPress={() => this.setPhotoId(m._id)}>
                                        <Image
                                            style={styles.image}
                                            source={{ uri: config.ConfigSettings.uploadsFolder + m.name }}
                                            alt={m.name}
                                        />
                                    </TouchableOpacity>)}
                                </View>}

                            </ScrollView>)
                        : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#fff" />
                            {/* <Text style={{color: colors.color6}}>Please wait</Text> */}
                        </View>
                }
            </View>
        );
    }
}

//cf71f2
const styles = {
    label: {
        color: "#777", fontSize: 14, letterSpacing: 1, fontFamily: fonts.galano, marginBottom: 5
    },
    detailBox: {
        marginTop: 5, marginBottom: 20, padding: 20, borderRadius: 5, backgroundColor: colors.color2
    },
    detailText: {
        color: "#dfdfe5", fontSize: 18, fontFamily: fonts.galano,
    },
    actName: {
        fontSize: 40, color: "#98999e", marginVertical: 15, fontWeight: 'bold'
    },
    actType: {
        color: "#fff"
    },
    actTime: {
        color: "#fff"
    },
    rateBtn: {
        backgroundColor: 'green', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 5
    },
    image: {
        width: 100, height: 100
    }
}


function mapStateToProps(state) {
    return {
        act_id: state.acts.act_id,
        activeAccount: state.common.activeAccount
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        setPhotoId: (_id) => dispatch({ type: 'SHOW_PHOTO_ID', id: _id }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(Act);