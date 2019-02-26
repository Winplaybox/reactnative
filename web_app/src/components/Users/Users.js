import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

const getUsers = gql`
    {
        users{
            firstName lastName emp_id
        }
    }
`;

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            filter: ""
        }
    }

    handleChange = (event) => {
        this.setState({
            filter: event.target.value
        })
    }

    filter = (user) => {
        let str = `${user.firstName}_${user.lastName}_${user.emp_id}`.toLowerCase();
        let filter = this.state.filter.toLowerCase();
        if (filter.length == 0) return { display: "none" };
        return (str.indexOf(filter) > -1) ? { display: "block" } : { display: "none" };
    }

    displayUsers = () => {
        var data = this.props.data;
        if (data.loading) {
            return <div>Loading Users</div>
        } else {
            return data.users.map((user, i) =>
                <li className="list-group-item" onClick={() => this.props.Onfilter(user.emp_id, `${user.firstName} ${user.lastName}`)} style={this.filter(user)} key={i}>{user.emp_id.padStart(5, "0")} - {user.firstName} {user.lastName} </li>
            )
        }
    }

    render() {
        return (
            <div className="UserDetails">
                <input type="search" id="SearchEmpId" className="FixedInput form-control" placeholder="Search..." onChange={this.handleChange} />
                <ul id="UserList" className="list-group">{this.displayUsers()}</ul>
            </div>
        );
    }
}

export default graphql(getUsers)(App);
