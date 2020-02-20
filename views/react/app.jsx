'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const axios = require('axios')

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            from: { 'name': '' },
            to: { 'address': '' },
            subject: '',
            content: ''
        }
    }

    validateEmail(email) {
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    }

    handleFormSubmit(event) {
        event.preventDefault();
        console.log(this.state);

        if (!this.state.from.name || this.state.from.name.trim() === '') {
            console.log("From field is not set.");
            window.alert("The from name of the email is not set");
            return;
        }

        if (!this.validateEmail(this.state.to.address)) {
            console.log("To email address field is invalid");
            window.alert("To email address field is invalid.");
            return;
        }

        if (!this.state.subject || this.state.subject.trim() === '') {
            console.log("Subject field is not set.")
            window.alert("The subject of the email is not set.")
            return;
        }

        if (!this.state.content || this.state.content.trim() === '') {
            console.log("Content field is not set.")
            window.alert("The content of the email is not set.")
            return;
        }

        axios({
            method: 'post',
            url: '/emails/submit',
            headers: { 'content-type': 'application/json' },
            data: this.state
        })
            .then(result => {
                var response = result.data.message;
                if (result.data.emailId != null) {
                    response = response + "\nEmail id: " + result.data.emailId;
                }
                window.alert(response);

                console.log("Result:" + response);
            })
            .catch(error => {
                window.alert("Failed: " + error.message);
                console.log("Error: " + error.message);
            });
    }

    render() {
        return (
            <div className="App">
                <p>Email service</p>
                <div>
                    <form action="#" >
                        <label>From</label>
                        <input type="text" id="fromid" name="from" placeholder="Email sender's name.."
                            value={this.state.from.name}
                            onChange={e => this.setState({ from: { 'name': e.target.value } })}
                        />
                        <label>Recipient</label>
                        <input type="email" id="toid" name="to" placeholder="Recipient's email address."
                            value={this.state.to.address}
                            onChange={e => this.setState({ to: { 'address': e.target.value } })}
                        />
                        <label>Subject</label>
                        <input type="text" id="subjectid" name="subject" placeholder="The subject of your email.."
                            value={this.state.subject}
                            onChange={e => this.setState({ subject: e.target.value })}
                        />
                        <label>Content</label>
                        <textarea id="contentid" name="content" placeholder="The content of your email.."
                            onChange={e => this.setState({ content: e.target.value })}
                            value={this.state.content}
                        ></textarea>

                        <input type="submit" onClick={e => this.handleFormSubmit(e)} value="Submit" />
                    </form >
                </div>
            </div>
        );
    }
}

// tag::render[]
ReactDOM.render(
    <App />,
    document.getElementById('react')
)