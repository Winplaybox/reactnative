import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

import Users from '../Users/Users';

const getActs = gql`
    {
        acts {
            name,_id,type,time,desc,actors,performers{firstName,lastName,emp_id}
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
                { value: "live_band", text: "Live Band" },
                { value: "fashion_show", text: " Fashion Show" }
            ],
            actors: [],
            added: false
        }
    }

    handleChange(event) { }

    formatDate = (d) => {
        var date = new Date(parseInt(d))
        var dateStr = `${date.getFullYear()}-${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
        dateStr = dateStr.padStart(2, "0");
        return dateStr;
    }

    Submit = (i) => {
        var Op = {
            id: this.actId[i].value,
            name: this.actName[i].value,
            type: this.actType[i].value,
            time: new Date(this.actTime[i].value).getTime(),
            desc: this.actDesc[i].value,
            actors: this.actActors[i]
        }
        console.log(Op)
        var fetchOption = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Op)
        }
        fetch('https://zeal-server.herokuapp.com/acts/edit', fetchOption)
            .then(response => {
                // console.log(response)
            }).catch(err => {
                // console.log(err)
            })

        this.setState({ added: true })
        setTimeout(() => {
            this.setState({ added: false })
        }, 2000)
    }

    Delete = (i) => {
        console.log("deleteId" + this.actId[i].value)
        let deleteActs = gql`
        mutation{
            deleteAct(id:"${this.actId[i].value}"){
            _id
            }
        }`;
        var Op = {
            id: this.actId[i].value,
            name: this.actName[i].value,
            type: this.actType[i].value,
            time: new Date(this.actTime[i].value).getTime(),
            desc: this.actDesc[i].value,
            actors: this.actActors[i]
        }
        var fetchOption = {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Op)
        }
        fetch('https://zeal-server.herokuapp.com/acts/delete', fetchOption)
            .then(response => {
                // console.log(response)
            }).catch(err => {
                // console.log(err)
            })
        document.getElementById('form'+i).remove();
    }

    filterClickHandle = (i, id, name) => {
        // console.log(i + " _ " + id);
        let actors = [...this.state.actors];
        if (!this.actActors[i].includes(id)) {
            this.actActors[i].push(id);
        }
        if (!this.actActorsName[i].includes(name)) {
            this.actActorsName[i].push(name);
        }
        actors[i] = this.actActorsName[i].join(", ");
        // console.log(this.actActors[i])
        // console.log(actors);
        this.setState({ actors: actors })
    }

    removeActorName = (i, _index) => {
        debugger;
        console.log('formNo:' + i + "index" + _index);
        console.log(this.actActorsName[i] + "," + this.actActors[i])
        let removeName = [...this.actActorsName[i]]
        removeName.splice(_index, 1);
        this.actActorsName[i] = removeName

        let removeID = [...this.actActors[i]];
        removeID.splice(_index, 1);
        this.actActors[i] = removeID;

        let actors = [...this.state.actors];
        actors[i] = this.actActorsName[i].join(", ");
        this.setState({ actors: actors })
    }

    displayActs = () => {
        var data = this.props.data;

        if (data.loading) {
            return <div>Loading Acts</div>
        } else {
            if (!this.actId) this.actId = new Array(data.acts.length);
            if (!this.actName) this.actName = new Array(data.acts.length);
            if (!this.actType) this.actType = new Array(data.acts.length);
            if (!this.actTime) this.actTime = new Array(data.acts.length);
            if (!this.actDesc) this.actDesc = new Array(data.acts.length);
            if (!this.actActors) {
                this.setState({ actors: new Array(data.acts.length).fill("") });
                this.actActors = new Array(data.acts.length).fill([]);
                this.actActors.map((a, i) => {
                    this.actActors[i] = data.acts[i].performers.map(p => p.emp_id);
                    let stateActors = this.state.actors;
                    stateActors[i] = data.acts[i].performers.map(p => {
                        return p.firstName + " " + p.lastName
                    }).join(", ")
                    this.setState({ actors: stateActors })
                })
                console.log(this.actActors)

            }
            if (!this.actActorsName) {
                this.actActorsName = new Array(data.acts.length).fill([]);
                data.acts.map((a, i) => {
                    let performers = a.performers.map(p => p.firstName + " " + p.lastName)
                    this.actActorsName[i] = performers
                })
            }

            return data.acts.map((act, i) =>
                <div className='form-row' key={i} data-id={i + 1} id={"form"+i}>
                    <input type="hidden" ref={(input) => this.actId[i] = input} value={act._id} />
                    <div className="form-group col-12 col-lg-3">
                        <label>Name: </label>
                        <input type="text" className="form-control" ref={(input) => this.actName[i] = input} defaultValue={act.name} placeholder="Enter Name" />
                    </div>

                    <div className="form-group col-12 col-lg-3">
                        <label data-type={act.type}>Type:</label>
                        <select className="form-control" onChange={this.handleChange.bind(this)} ref={(select) => this.actType[i] = select} defaultValue={act.type}>
                            {this.state.eventTypes.map((item, i) =>
                                <option key={i} value={item.value}>{item.text}</option>
                            )}
                        </select>
                    </div>

                    <div className="form-group col-12 col-lg-3">
                        <label>Time:</label>
                        <input type="datetime-local" className="form-control" defaultValue={this.formatDate(act.time)} onChange={this.handleChange.bind(this)} ref={(input) => this.actTime[i] = input} />
                    </div>

                    <div className="form-group col-12 col-lg-3">
                        <label>Desc:</label>
                        <input type="text" className="form-control" defaultValue={act.desc} onChange={this.handleChange.bind(this)} ref={(input) => this.actDesc[i] = input} placeholder="Enter Description" />
                    </div>

                    <div className="form-group col-12 col-lg-9">
                        {/* {this.actActors[i]=[...this.actActors[i],...act.actors]  } */}
                        <label className="actorList"
                        >Actors:{this.state.actors[i].split(",").map((a, _index) => <span className="actor" key={_index} onClick={() => { this.removeActorName(i, _index) }}>{a}</span>)}
                        </label>
                        <Users Onfilter={(id, name) => this.filterClickHandle(i, id, name)} />
                    </div>

                    <div className="col-3 submitBtn">
                        <button className="btn btn-primary" id="SubmitForm" onClick={() => this.Submit(i)}>Save</button>
                        <button className="btn btn-danger" id="DeleteForm" onClick={() => this.Delete(i)}>Delete</button>
                    </div>
                </div>
            )
        }
    }

    render() {
        return (
            <div className="ActList">
                <h3>List of Acts</h3>
                {this.displayActs()}
                {
                    this.state.added &&
                    <div>
                        <div className="modal fade show" tabIndex="-1" role="dialog" data-class="" style={{ padding: '17px', display: 'block' }}>
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header alert-success">
                                        <h5 className="modal-title">Success</h5>
                                    </div>
                                    <div className="modal-body">
                                        Data Saved
                                    </div>
                                    <div className="modal-footer" style={{ display: 'none' }}>
                                        <button type="button" className="btn btn-primary" data-dismiss="modal"><i className="fa fa-check"></i><span>Ok</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-backdrop fade show"></div>
                    </div>
                }

            </div>

        );
    }
}

export default graphql(getActs)(App);
// export default graphql(getActs)(App);

