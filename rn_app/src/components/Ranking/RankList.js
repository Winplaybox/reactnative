import React from 'react';
import { View, ScrollView, RefreshControl, Dimensions, Text, Image, TouchableOpacity, TextInput, Modal, Alert, Button } from 'react-native';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { colors, fonts } from '../common/Styles';
import { points } from '../common/Values';
import { config } from '../../../config';
import { gqlOptions } from '../../utils/Fetch';
const width = Dimensions.get('window').width;

class RankList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            ranking: []
        }
        this.mounted = true;
        this.graphql();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    graphql = () => {
        let query = `{
            media {
                likes_count
                view_count
                comments { _id }
                author {
                    firstName lastName emp_id comments {_id}
                }
            }
        }`;
        let fetchOptions = gqlOptions(query);

        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                this.props.log(res);
                this.props.log("rank load successful");
                if (this.mounted) {
                    let ranking = [];
                    console.log(res.data)
                    res.data.media.map(m => {
                        let emp_id = m.author.emp_id;
                        let count = ranking.filter(r => r.emp_id == emp_id).length;
                        if (count == 0) {
                            ranking.push({
                                ...m.author,
                                points: points.photoUpload + (m.likes_count * points.like) + (m.view_count * points.view) + (m.comments.length * points.comment) + (m.author.comments.length * points.selfComment)
                            })
                        } else {
                            ranking.filter(r => r.emp_id == emp_id)[0].points += points.photoUpload + (m.likes_count * points.like) + (m.view_count * points.view) + (m.comments.length * points.comment);
                        }
                    })
                    ranking.sort((a, b) => {
                        return a.points > b.points ? -1 : 1;
                    })
                    this.setState({ ranking: ranking, refreshing: false })
                    this.props.log(this.state.ranking)
                }
            })
            .catch((error) => {
                this.props.log(error);
                this.setState({ refreshing: false });
            });
    }

    navigateTo = (route) => {
        this.props.navTo(route);
    }

    _onRefresh = () => {
        this.setState({ refreshing: true });
        this.graphql();
    }

    render() {
        let lgcolors = ['#948e77', '#674f46', colors.color3];
        return (
            <View style={{ ...styles.screen, backgroundColor: colors.color5 }}>
                <Text style={{ fontFamily: fonts.galano, color: "#7b8191", marginTop: 30, marginBottom: 15, marginLeft: 15, fontSize: 30 }}>Leaderboard</Text>

                <ScrollView horizontal={false} decelerationRate={0.1} snapToInterval={width} snapToAlignment={"center"} refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                    />
                }>
                    <View style={{ paddingHorizontal: 15 }}>

                        {new Array(10).fill(0).map((r, k) =>
                            <View key={k}>
                                {/* {k < 3 && <LinearGradient
                                    style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 54 }}
                                    start={{ x: 0.3, y: 0.6 }} end={{ x: 0.3, y: 0 }}
                                    locations={[0, 0, 1]}
                                colors={['#363741', '#363741', lgcolors[k]]} />} */}

                                {this.state.ranking.length > k ? <View style={{ ...styles.row, ...styles.topRows[k], ...styles.topRow }} >
                                    {k < 3 && <View style={styles.rankImageContainer}>
                                        {k == 0 && <Image source={require("../../../assets/images/1.png")} alt='1.png' />}
                                        {k == 1 && <Image source={require("../../../assets/images/2.png")} alt='2.png' />}
                                        {k == 2 && <Image source={require("../../../assets/images/3.png")} alt='3.png' />}
                                    </View>}

                                    {k > 2 && <Text style={styles.rank}>{k + 1}</Text>}
                                    <Text style={styles.name}>{this.state.ranking[k].firstName} {this.state.ranking[k].lastName}</Text>
                                    <Text style={styles.points}>{this.state.ranking[k].points}</Text>
                                </View> : <View style={{ ...styles.row, ...styles.topRows[k], ...styles.topRow }} >
                                        <Text style={styles.rank}>-</Text>
                                        <Text style={styles.name}>-</Text>
                                        <Text style={styles.points}>-</Text>
                                    </View>}


                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

//cf71f2
const styles = {

    row: {
        /*marginTop: 10,*/ flexDirection: 'row', justifyContent: "space-between", position: 'relative', overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: colors.color6, backgroundColor: colors.color2, height: 60
    },
    topRow: { paddingVertical: 10, alignItems: 'center' },
    topRows: [
        { backgroundColor: "#423e33" },
        { backgroundColor: colors.color4 },
        { backgroundColor: colors.color3 },
    ],
    name: { color: '#ccc', flex: 1, fontSize: 18 },
    rank: { color: colors.color6, width: 60, paddingRight: 10, textAlign: 'center', fontSize: 18 },
    rankImageContainer: { width: 60, justifyContent: 'center', flexDirection: 'row', paddingRight: 10 },
    points: { color: colors.color1, fontWeight: 'bold', width: 50, fontSize: 18 },
    screen: {
        backgroundColor: "#000", flex: 1, height: "100%"
    }
}


function mapStateToProps(state) {
    return {
        rank_id: state.ranks.rank_id
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(RankList);