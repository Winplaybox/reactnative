import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { colors, sizes } from '../common/Styles';

import { connect } from 'react-redux';
const { width, height } = Dimensions.get('window');

class Logger extends Component {
    constructor(props) {
        super(props);
    }

    goback = () => {
        console.log("goBack")
        this.props.goBack();
    }

    debug = () => {
        this.props.debug();
    }

    render() {
        return (
            <View style={{ position: 'absolute', top: 0, right: 0 }}>

                {/* <TouchableOpacity style={{backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 10}} onPress={this.debug}>
                    <Text style={styles.icon}>&#xf188;</Text>
                </TouchableOpacity> */}

                {this.props.visibility ?
                    <View pointerEvents="box-none" style={{ width: width, height: height-250, backgroundColor: 'rgba(0, 0, 0, 1)' }}>
                        <ScrollView>
                            {this.props.logs.map((log, i) => <View key={i} style={{ marginBottom: 10 }}>
                                <Text style={{ color: '#555', fontSize: 12 }}>{log.time}</Text>
                                <Text style={{ color: 'rgb(0,100,0)', fontSize: 12 }}>{log.msg}</Text>
                            </View>)}
                        </ScrollView>
                    </View> : <View></View>}
            </View>


        );
    }
}

const styles = {
    icon: {
        color: '#ccc', fontSize: 30, fontFamily: 'FontAwesome5ProLight'
    },
    header: {
        backgroundColor: colors.color4, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: sizes.headerHeight
    }
}

function mapStateToProps(state) {
    return {
        logs: state.log.logs,
        visibility: state.log.visible
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        debug: () => dispatch({ type: 'TOGGLE_LOGS' })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(Logger)