import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Spin, Checkbox, Button, Input, Popover, Icon, Switch, Select, Modal } from 'antd'
import 'antd/dist/antd.css';
import axios from 'axios';
import TimeAgo from 'react-timeago'
import italianStrings from 'react-timeago/lib/language-strings/it'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

const BACKENDURL = 'http://192.168.1.73:3001/api';

const noBug = [
    'No grazie',
    'No',
    'Per favore no',
    'Ti prego no',
    'Sarebbe inutile',
    'Neanche per sogno',
]
class Index extends React.Component {

    render() {
        return (<h2>
            <Button onClick={() => {
                axios.post(`${BACKENDURL}/createChecklist`)
                .then((res) => {
                    this.props.history.push(`/${res.data.id}`)
                })}}
            > New Checklist </Button>
        </h2>);
    }
}

class Checklist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.match.params.id,
            fetching: true,
            data: null,
            separated: false,
            showPriorityColors: false
        }

        this.getDataFromDb = this.getDataFromDb.bind(this);

        this.getDataFromDb();
    }

    getDataFromDb = () => {
        fetch(`${BACKENDURL}/getData/${this.state.id}`)
          .then((data) => data.json())
          .then((res) => {
            if (res.data)
                this.setState({
                data: res.data.checklist,
                fetching: false,
                })
            else
                this.setState({
                error: true,
                fetching: false,
            })
            });
      };

    updateDescription = (event, line) => {
        axios.post(`${BACKENDURL}/updateLineDescription/${this.state.id}`, 
        {
            line_id: line._id,
            description: event.target.value
        })
        .then((res) => {
            this.setState({
                data: res.data.data.checklist,
            })
        });
    }
    
    renderLine(line, index) {
        console.log(this.state)
        let warningColor;
        if (line.priority === 2)
            warningColor = 'red'
        else if (line.priority === 1)
            warningColor = 'yellow'
        else
            warningColor = 'white'
        return <Popover 
            content={line.description} 
            placement="right" 
            trigger="hover"
            autoAdjustOverflow={false}
            key={`line${index}`}
            
            >
                <div style={{
                    display: 'flex',
                    width: '80%',
                    justifyContent: 'space-evenly',
                    alignItems: 'center'

                }}>
                    {this.state.showPriorityColors && <Icon type="warning" style={{
                        color: warningColor,
                        marginRight: '10px',
                        fontSize: '24px'
                    }} />}
                    <Select
                        defaultValue={line.priority}
                        onChange={(value) => {
                            axios.post(`${BACKENDURL}/updatePriority/${this.state.id}`, 
                            {
                                line_id: line._id,
                                priority: value
                            })
                            .then((res) => {
                                this.setState({
                                    data: res.data.data.checklist,
                                    })
                                });
                            }
                        }
                        style={{
                            width: '130px',
                            textAlign: 'center'
                        }}
                        >
                            <Select.Option value={0} style={{ textAlign: 'center' }} >Bassa</Select.Option>
                            <Select.Option value={1} style={{ textAlign: 'center' }} >Media</Select.Option>
                            <Select.Option value={2} style={{ textAlign: 'center' }} >Alta</Select.Option>
                        </Select>
                    <Input
                        addonBefore={
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '50px',
                                }}>
                                <Checkbox 
                                    onChange={(event) => {
                                        axios.post(`${BACKENDURL}/updateLineCompleted/${this.state.id}`, 
                                        {
                                            line_id: line._id,
                                            completed: event.target.checked
                                        })
                                        .then((res) => {
                                            this.setState({
                                                data: res.data.data.checklist,
                                                })
                                            });
                                        }
                                    }
                                    checked={line.completed}
                                />
                                <div>{index})</div>
                                
                            </div>
                        }
                        addonAfter={<Icon
                            type='close'
                            style={{
                                color: 'red',
                                fontSize: '16px'
                            }}
                            onClick={(event) => {
                                axios.post(`${BACKENDURL}/deleteLine/${this.state.id}`, 
                                {
                                    line_id: line._id,
                                })
                                .then((res) => {
                                    this.setState({
                                        data: res.data.data.checklist,
                                    })
                                });
                            }
                        }   
                            // checked={line.completed}
                        />}
                        style={{
                            color: 'red',
                        }}
                        defaultValue={line.description}
                        key={line.description}
                        onChange={(event) => console.log(event)}
                        onPressEnter={(event) => this.updateDescription(event, line)}
                        onBlur={(event) => this.updateDescription(event, line)}
                    />
                    {line.created && 
                        <TimeAgo 
                        style={{ textAlign: 'center', width: '200px' }} 
                        date={line.created}
                        formatter={buildFormatter(italianStrings)}/>}
                </div>
                
            </Popover>
    }

    render() {
        let index = 1;
        let index2 = 1;
        if (this.state.fetching)
            return <Spin size='large' />;
        if (this.state.error)
            return <div>Checklist not found</div>;
        if (this.state.data)
        {

            let lines;
            if (!this.state.separated)
                lines = this.state.data.map((line) => this.renderLine(line, index++));
            else
            {
                lines = <React.Fragment>
                    {this.state.data.map((line) => {
                        index++;
                        if (line.completed)
                            return this.renderLine(line, index-1)
                    })}
                    {this.state.data.map((line) => {
                        index2++;
                        if (!line.completed)
                            return this.renderLine(line, index2-1)
                    })}
                </React.Fragment>

            }
            return (<div style={{
                display: 'flex',
                // justifyContent: 'space-evenly',
                alignItems: 'center',
                flexDirection: 'column',
                width: '80%'
            }}>
                <Button onClick={() => {
                    axios.post(`${BACKENDURL}/createChecklist`)
                    .then((res) => {
                        this.props.history.push(`/${res.data.id}`)
                    })}}
                > Nuova Checklist </Button>
                <h2>Checklist {this.state.id}</h2>
                <div 
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}>
                    <div
                        style={{
                            width: '200px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '20px',
                            paddingBottom: '20px',
                            marginRight: '50px',
                        }}>
                        <Switch 
                            defaultChecked={false}
                            onChange={(checked) => {
                                this.setState({separated: checked})
                            }}
                        />
                        Ordina per completate
                    </div>
                    <div
                        style={{
                            width: '200px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '20px',
                            paddingBottom: '20px',
                            marginRight: '50px',
                        }}>
                        <Switch 
                            defaultChecked={false}
                            onChange={(checked) => {
                                this.setState({showPriorityColors: checked})
                            }}
                        />
                        Mostra Icone Priorità
                    </div>
                </div>

                {lines}
                <Button 
                    onClick={() => {
                        axios.post(`${BACKENDURL}/addLine/${this.state.id}`)
                        .then((res) => {
                            this.setState({
                                data: res.data.data.checklist,
                            })
                        });
                    }} 
                    style={{
                        marginTop: '20px',
                        marginBottom: '20px',
                    }}
                > Aggiungi task </Button>
                <Popover
                    content={'Segnala un bug'} 
                    placement="leftBottom" 
                    trigger="hover"
                    autoAdjustOverflow={false}
                    >
                    <Button
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                        }}
                        onClick={() => {
                            Modal.info({title: noBug[Math.floor(Math.random() * noBug.length)]});
                        }}
                        >
                        <Icon type="bug" />
                    </Button>
                </Popover>


            </div>);

        }
        return <div>EMPTY!</div>
    }
}

function AppRouter() {
  return (
    <Router>
      <div style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: 'lightblue',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
      }}>
        <Route path="/" exact component={Index} />
        <Route path="/:id/" component={Checklist} />
      </div>
    </Router>
  );
}

export default AppRouter;