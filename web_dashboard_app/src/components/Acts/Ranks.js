import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

import Users from '../Users/Users';

const getActs = gql`
    {
        acts {
            name,_id, ratings {_id user_id  rating}
        }
    }
`;


class App extends Component {
    constructor(props) {
        super(props);

    }

    actsRating = () => {
        var data = this.props.data;
        let ratings = [];
        console.log(data.acts)
        data.acts.map(a => {
            let rating = 0;
            a.ratings.map(r => rating += r.rating )
            ratings.push({
                name: a.name,
                rating: rating,
                votes: a.ratings.length
            })
        })
        // console.log(ratings);

        if (!this.actId) this.actId = new Array(data.acts.length);
        if (!this.actName) this.actName = new Array(data.acts.length);

        return ratings.sort((a,b) => a.rating < b.rating ? 1 : -1 ).map((act, i) =>
            i < 10 && <tr key={i} data-id={i + 1} >
                <td>{i+1}</td>
                <td>{act.name}</td>
                <td>{act.rating}</td>
                <td>{act.votes}</td>
            </tr>
        )
    }

    render() {
        return (
            <div className="ActList">
                <h3>Ratings</h3>
                <table class="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Act Name</th>
                            <th>Points</th>
                            <th>No. of Votes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.data.loading
                            ? <tr></tr>
                            : this.actsRating()
                        }
                    </tbody>
                </table>
            </div>

        );
    }
}

export default graphql(getActs)(App);