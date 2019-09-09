import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Spin, Checkbox, Button, Input } from 'antd'
import 'antd/dist/antd.css';
import axios from 'axios';

const BACKENDURL = 'http://localhost:3001/api';
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
        }

        this.getDataFromDb = this.getDataFromDb.bind(this);

        this.getDataFromDb();
        // axios.post('${BACKENDURL}/putData', {
        //     id: '1231223123212',
        //     message: 'message',
        // });

        // setTimeout(() => {
        //     this.setState({ 
        //         fetching: false,
        //         data: [
        //             {
        //                 completed: false,
        //                 description: ' af sdlanfiojada ajdoadsmasdma'
        //             },
        //             {
        //                 completed: false,
        //                 description: ' af sdlanfiojada ajdoadsmasdma1'
        //             },
        //             {
        //                 completed: true,
        //                 description: ' af sdlanfiojada ajdoadsmasdma2'
        //             },
        //         ] })
        // }, 1000)
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
    
    renderLine(line) {
        return <div style={{
            display: 'flex',
            width: '50%',
            justifyContent: 'space-evenly'

        }}>
            
            <Input
                addonBefore={<Checkbox 
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
                />}
                defaultValue={line.description}
                onPressEnter={(event) => this.updateDescription(event, line)}
                onBlur={(event) => this.updateDescription(event, line)}
            />
        </div>
    }

    render() {
        let index = 0;
        if (this.state.fetching)
            return <Spin size='large' />;
        if (this.state.error)
            return <div>Checklist not found</div>;
        if (this.state.data) {
            return (<div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                width: '50%'
            }}>
                <h2>Checklist {this.state.id}</h2>
                {this.state.data.map((line) => this.renderLine(line, index++))}
                <Button onClick={() => {
                    axios.post(`${BACKENDURL}/addLine/${this.state.id}`)
                    .then((res) => {
                        this.setState({
                            data: res.data.data.checklist,
                        })
                    });
                }} > Add Element </Button>
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