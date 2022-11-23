import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import { PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
Amplify.configure(aws_exports);

var SUB_TOPIC = "esp32/pub";
var PUB_TOPIC = "esp32/sub";

// Apply plugin with configuration
Amplify.addPluggable(new AWSIoTProvider({
  aws_pubsub_region: 'us-east-1',
  aws_pubsub_endpoint: 'wss://a2b5rk5e1o4oyd-ats.iot.us-east-1.amazonaws.com/mqtt',
}));

async function ProcessMessage(payload) {
  console.log('Message received', payload);
  let topic=payload.value[Object.getOwnPropertySymbols(payload.value)[0]];
  let temperature=payload.value.temperature;
  let temps=payload.value.temps;
  let scrollBox = document.getElementById('incomingMsg');
  scrollBox.innerHTML += "<b>NEW MESSAGE: </b><br></br> Topic: " + topic + "<br></br> Temperature: " + temperature + "<br></br> temps: " + temps + "  <br></br>";
  scrollBox.scrollTop = scrollBox.scrollHeight;
}

async function SendMessage() {
  let payload=document.getElementById('msg').value;
  document.getElementById('msg').value='';
  console.log(payload);
  await PubSub.publish(PUB_TOPIC, { msg: payload });
  document.getElementById('returnMsg').innerHTML = '<h3 style="color: green">Message sent!</h3>';
  let sentMsgBox = document.getElementById('sentMsg');
  sentMsgBox.innerHTML += payload + "<br></br>";
  sentMsgBox.scrollTop = sentMsgBox.scrollHeight;
}

function App() {
  subscribe();
  return (
    <div className="App">
      <div className="mt-5 row" style={{"background-color": "black", "align-items": "center", "justify-content": "center"}}>
        <img src={logo} style={{"height": "5vmin"}} alt="logo"></img>
        <h1 style={{"color": "white"}}>IoT POC </h1>
        <a href="https://www.etsmtl.ca/" className="pl-4"><img src="https://www.etsmtl.ca/content/img/logo_ets.svg" width="400" 
     height="300"  alt="Powered by ETS Cloud Computing"></img></a>
      </div>
      <div className="row">
        <div id="publisher" className="col ml-5 mt-5 mb-5 mr-3" style={{"border-style": "solid", "border-width": "2px"}}>
          <h2>Publisher</h2>
          <p>The box below can be used to publish messages back to your devices by publishing to the topic <b>{PUB_TOPIC}</b></p>
          <h5>Message: </h5>
          <input type="text" className="form-control" id="msg" name="msg" placeholder="Enter Message Here"></input>
          <br></br>
          <button className="btn btn-primary" onClick={SendMessage}>Send Message</button>
          <div id='returnMsg'></div>
          <br></br>
          <h3>Sent Messages:</h3>
          <p>Your sent messages will appear here</p>
          <div id='sentMsg' className="overflow-auto mb-5 border" syle={{"max-height": "220px"}}></div>
        </div>
        <br></br><br></br>
        <div id="subscriber" className="col mt-5 mr-5 mb-5" style={{"border-style": "solid", "border-width": "2px"}}>
          <h2>Subscriber</h2>
          <p>New messages from your device(s) that publish to the topic <b>{SUB_TOPIC}</b> will appear in the box below</p>
          <div id="incomingMsg" className="overflow-auto border" style={{"max-height": "200px"}}></div>
        </div>
      </div>
    </div>
  );
}

function subscribe() {
  PubSub.subscribe(SUB_TOPIC).subscribe({
    next: data => ProcessMessage(data),
    error: error => console.error(error),
    close: () => console.log('Done'),
  });
}

export default withAuthenticator(App, true);