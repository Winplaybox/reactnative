import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

import Users from '../Users/Users';

const getActs = gql`
    {
        acts {
            name,_id,type,time,desc,actors
        }
    }
`;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eventTypes: [
                { value: "dance_solo", text: "Solo Dance" },
                { value: "dance_group", text: "Group Dance" },
                { value: "singing_solo", text: "Solo Singing " },
                { value: "singing_group", text: "Group Singing" },
                { value: "comedy_standup", text: "Standup Comedy" },
                { value: "comedy_mimicry", text: "Mimicry Comedy" },
                { value: "skit", text: "Skit" },
                {value: "live_band",  text: "Live Band"},
                { value: "fashion_show", text: " Fashion Show" }
            ],
            name: '',
            type: '',
            time: '',
            desc: '',
            added: false,
            actors: [],
            actorId: []
        }
    }

    handleChange(event) { }

    formatDate = (d) => {
        var date = new Date(parseInt(d))
        var dateStr = `${date.getFullYear()}-${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
        dateStr = dateStr.padStart(2, "0");
        return dateStr;
    }


    addData = () => {
        var ov = {
            name: this.actName.value,
            type: this.actType.value,
            time: new Date(this.actTime.value).getTime(),
            desc: this.actDesc.value,
            actors: this.state.actorId
        }
        console.log(ov)
        var fetchOption = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ov)
        }
        fetch('https://zeal-server.herokuapp.com/acts', fetchOption)
            .then(response => {
                this.actName.value = "";
                this.actDesc.value = "";
                this.actActors.value = "";
                this.setState({
                    actors:[],
                    actorId:[]
                })
            }).catch(err => {
                console.log(err)
            })
       
        this.setState({ added: true })
        setTimeout(() => {
            this.setState({ 
                added: false,
                actors:[],
                actorId:[]
            })
        }, 2000)

    }
    filterClickHandle = (id, name) => {
        // console.log(name + " _ " + id);
        let actorNames = [...this.state.actors]
        if (!actorNames.includes(name)) {
            actorNames.push(name)
        }

        let actorsId = [...this.state.actorId]
        if (!actorsId.includes(id)) {
            actorsId.push(id)
        }

        this.setState({
            actors: actorNames,
            actorId: actorsId
        })
    }

    removeActorName = (_index) => {
        console.log("index" + _index)
        let removeName = [...this.state.actors]
        let removeId = [...this.state.actorId]
        removeName.splice(_index, 1);
        removeId.splice(_index, 1);
        this.setState({
            actors: removeName,
            actorId: removeId
        });
        // console.log("removeName:"+removeName)
        // console.log(this.state.actors)
    }

    addActs = () => {

        return <div className='form-row' >
            <div className="form-group col-12 col-lg-3">
                <label>Name: </label>
                <input type="text" className="form-control" onChange={this.handleChange.bind(this)} ref={(input) => this.actName = input} placeholder="Enter Name" />
            </div>

            <div className="form-group col-12 col-lg-3">
                <label>Type:</label>
                <select className="form-control" onChange={this.handleChange.bind(this)} ref={(select) => this.actType = select}>
                    {this.state.eventTypes.map((item, i) =>
                        <option key={i} value={item.value}>{item.text}</option>
                    )}
                </select>
            </div>

            <div className="form-group col-12 col-lg-3">
                <label>Time:</label>
                <input type="datetime-local" className="form-control" defaultValue="2019-02-09T17:00" onChange={this.handleChange.bind(this)} ref={(input) => this.actTime = input} />
            </div>

            <div className="form-group col-12 col-lg-3">
                <label>Desc:</label>
                <input type="text" className="form-control" onChange={this.handleChange.bind(this)} ref={(input) => this.actDesc = input} placeholder="Enter Description" />
            </div>

            <div className="form-group col-12 col-lg-9">
                <label className="actorList">
                    Actors:
                        {/* {this.state.actors.map((a,_index )=> <span data-index={_index} key={_index} className="actor">{a}</span>)} */}
                    {this.state.actors.map((a, _index) => <span key={_index} className="actor" onClick={() => { this.removeActorName(_index) }}>{a}</span>)}
                </label>

                <Users Onfilter={(id, name) => this.filterClickHandle(id, name)} />
            </div>

            <div className="col-3 submitBtn">
                <button className="btn btn-primary" id="addActBtn" onClick={(e) => this.addData(e)}>Save</button>
            </div>

            <br /><br />
            {
                this.state.added && <div>Act added successfully.</div>
            }

        </div>
    }

    render() {
        return (
            <div className="ActList">
                <h3>Add Acts</h3>
                {this.addActs()}
            </div>
        );
    }
}

export default graphql(getActs)(App);

