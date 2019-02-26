import React from 'react';
import { View, ScrollView, Dimensions, Text, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { config } from './../../../config';

import { colors } from '../common/Styles';
import { gqlOptions, gqlURI } from '../../utils/Fetch';

const width = Dimensions.get('window').width;
class ActsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            act: []
        }
        this.graphql();
    }

    componentDidMount() {
    }

    graphql = () => {
        let query = `{ acts(id: "${this.props.act_id}") { name, time, type, performers {firstName, lastName} } }`;
        let fetchOptions = gqlOptions(query);

        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                console.log(res);
                this.setState({ act: res.data.acts })
                console.log(this.state.act)
            })
            .catch((error) => {
                this.props.log(uri);
                this.props.log(error);
            });
    }

    navigateTo = (route) => {
        console.log(`home to ${route}`)
        if (route == "ProductListing") {
            this.props.setListingGuid("");
        }
        this.props.navTo(route);
    }

    showActInfo = (id) => {
        this.props.showActInfo(id)
    }

    render() {
        formatDate = (date) => {
            let n = parseInt(date);
            let d = new Date(n);
            console.log(d)
            return <Text style={styles.actTime}>{d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</Text>
        }

        return (
            <View style={{ backgroundColor: '#fff', flex: 1, padding: 15 }}>
                {
                    this.state.act.length > 0 ?
                        this.state.act.map((act, k) => <View style={styles.actContainer} key={k}>
                            <Text style={styles.actName}>{act.name.toUpperCase()}</Text>
                            <Text style={styles.actType}>{act.type.toUpperCase().replace("_", " ")}</Text>
                            {formatDate(act.time)}
                            <Text>Performers:</Text>
                            {act.performers.map((p,i) => 
                                <View key={i}>
                                    <Text>{p.firstName} {p.lastName}</Text>
                                </View>
                            )}
                        </View>)
                        : <View>
                            <Text>Loading act</Text>
                        </View>
                }
            </View>
        );
    }
}

//cf71f2
const styles = {
    actContainer: {
        backgroundColor: "#0a79fe", marginBottom: 15, padding: 10, borderRadius: 10
    },
    actName: {
        fontSize: 24, fontWeight: "bold", color: "#fff"
    },
    actType: {
        color: "#fff"
    },
    actTime: {
        color: "#fff"
    }
}


function mapStateToProps(state) {
    return {
        act_id: state.acts.act_id
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(ActsList);