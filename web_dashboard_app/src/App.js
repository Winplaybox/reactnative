import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import Acts from './components/Acts/Acts';
import AddAct from './components/Acts/AddAct';
import Users from './components/Users/Users';
import Ranks from './components/Acts/Ranks';


const client = new ApolloClient({
    uri: 'https://zeal-server.herokuapp.com/graphql'
})



class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            route: "home"
        }
    }

    changeRoute = (route) => {
        this.setState({
            route: route
        })
    }

    getComponent = () => {
        let route = this.state.route;

        switch (route) {
            case 'acts':
                return <div><Acts /></div>;
            case 'addAct':
                return <div><AddAct /></div>;
            case 'ranks':
                return <Ranks />
            default:
                return <div><Ranks /></div>;
        }
    }

    render() {
        console.log(this.props)
        return (
            <ApolloProvider client={client}>
                <div className="header">
                    <ul>
                        <li onClick={() => this.changeRoute('home')} className="route">Home</li>
                        <li onClick={() => this.changeRoute('acts')} className="route">Acts</li>
                        <li onClick={() => this.changeRoute('addAct')} className="route">Add New Act</li>
                        <li onClick={() => this.changeRoute('ranks')} className="route">Ranks</li>
                    </ul>
                </div>
                <div className="comp">
                    {this.getComponent()}
                </div>
            </ApolloProvider>
        );
    }
}

export default App;
