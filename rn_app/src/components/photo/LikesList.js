import React from 'react'
import { View, ScrollView, Modal, Text,TouchableHighlight, TouchableOpacity } from 'react-native';
import { config } from '../../../config';
import { gqlOptions } from '../../utils/Fetch';
import { colors, fonts } from '../common/Styles';
import Avatar from '../user/Avatar';
import { connect } from 'react-redux';

class LikesList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,
            likes: []
        }

        this.mounted = true;
    }

    componentDidMount() {
        this.mounted && this.graphql();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    openLikes = () => {
        console.log('open likes')
        if (this.mounted) {
            this.setState({ modalVisible: true })
        }
    }

    openProfile = (id) => {
        this.props.setUserProfile(id);
        this.props.navTo("userprofile");
    }

    graphql = () => {
        let query = `{ 
            media(id: "${this.props.photo_id}") {
                _id
                likes {
                    time
                    user {
                        firstName, lastName, avatar, emp_id
                    }
                }
            } 
        }`;
        let fetchOptions = gqlOptions(query);
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => {
                return res.json()
            })
            .then(res => {
                console.log(res);
                if (this.mounted) {
                    this.setState({ likes: res.data.media[0].likes })
                    console.log("likes set");
                    console.log(this.state.likes);
                }
            })
            .catch((error) => {
                console.log(`error in: ` + query);
                console.log(error);
            });
    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                onRequestClose={() => this.setState({ modalVisible: false })}
                visible={this.state.modalVisible}>

                <View style={{ flex: 1, padding: 15, backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <TouchableHighlight style={{ paddingVertical: 5 }}
                        onPress={() => this.setState({ modalVisible: false })}>
                        <Text style={{ fontFamily: fonts.iconSolid, color: colors.color1, fontSize: 30, textAlign: 'right' }}>&#xf00d;</Text>
                    </TouchableHighlight>
                    <Text style={{fontFamily: fonts.galano, color: colors.color6, fontSize: 24, marginBottom: 10}}>{this.state.likes.length} Likes</Text>
                    <ScrollView
                        style={{ flex: 1, backgroundColor: colors.color5, paddingHorizontal: 15, paddingBottom: 30 }}>
                        {this.state.likes.length > 0 && this.state.likes.map((like, k) => <TouchableOpacity onPress={() => this.openProfile(like.user.emp_id)} style={styles.likeRow} key={k}>
                            <View style={{width: 40, height: 40, position: 'relative', borderRadius: 40, overflow: 'hidden', marginRight: 15}}>
                                <Avatar gender={like.user.gender} config={like.user.avatar} bg={colors.color6} />
                            </View>
                            <Text style={{ color: '#fff' }}>{like.user.firstName} {like.user.lastName}</Text>
                        </TouchableOpacity>)}
                    </ScrollView>
                </View>

            </Modal>
        );
    }
}

const styles = {
    likeRow: {
        borderBottomWidth: 1, borderBottomColor: colors.color3, alignItems: 'center', flexDirection: 'row', height: 60
    }
}

function mapStateToProps(state) {
    return {
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg }),
        setUserProfile: (id) => dispatch({ type: 'SET_USER_ID', id: id })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch, null, { forwardRef: true })(LikesList);