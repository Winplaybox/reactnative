import React, { Component } from 'react';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }


    login = () => {
        var body = {
            emp_id: "",
            dob: "", //YYYY-MM-DD
        }
        console.log(body)
        var fetchOption = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
        fetch('https://zeal-server.herokuapp.com/users/login', fetchOption)
            .then(response => {
                console.log(response)
            }).catch(err => {
                console.log(err)
            })

    }

    render() {
        return (
            <div className="Login">
                <h3>Login</h3>
            </div>
        );
    }
}

export default Login;