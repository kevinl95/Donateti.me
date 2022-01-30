import { Card, Typography } from "antd";
import React from "react";
import { useMoralis } from "react-moralis";
import validator from 'validator';
import ReactModal from 'react-modal';
import QRCode from 'qrcode';
import axios from 'axios';
import "./form.css";
import banner from "./assets/DonatetimeBanner.gif";
import info from "./assets/DonatetimeInfographic.svg";
import loginGraphic from "./assets/DonatetimeLogin.png";
import encouragement from "./assets/encouragement.png"

const { Text } = Typography;

const styles = {
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  text: {
    fontSize: "16px",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "0.5rem",
    width: "50%"
  },
};

class PayForm extends React.Component {
  constructor(props) {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    var defaultInput = params.get('token');
    if (defaultInput == null) {
      defaultInput = "";
    }
    super(props);
    this.state = {value: defaultInput};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {    this.setState({value: event.target.value});  }
  handleSubmit(event) {
    console.log('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>        <label>
          <input type="text" value={this.state.value} onChange={this.handleChange} />        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

class RegForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {pnum: '', email: '', showModal: false};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.emailError = "";
    this.pnumError = "";
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.RegError = "Loading, please wait";
  }

  onFieldChange(fieldName) {
      return function (event) {
          this.setState({[fieldName]: event.target.value});
      }
  }
  handleOpenModal () {
    this.setState({ showModal: true });
  }
  handleCloseModal () {
    this.setState({ showModal: false });
  }
  handleSubmit(event) {
    console.log('A name was submitted: ' + this.state.email + ' ' + this.state.pnum);
    var invalidInput = false;
    if (!validator.isEmail(this.state.email)) {
      this.emailError = "Invalid email address";
      invalidInput = true;
    }
    if (!validator.isMobilePhone(this.state.pnum)) {
      this.pnumError = "Invalid phone number";
      invalidInput = true;
    }
    if (invalidInput) {
      this.forceUpdate();
    } else {
      this.emailError = "";
      this.pnumError = "";
      this.forceUpdate();
      const inputData = { phone: this.state.pnum, cryptocurrency: "btc" };
      axios.post('https://thingproxy.freeboard.io/fetch/https://alfa.top/api/v1/lookup', inputData)
        .then(response => {
          if (!response.data['autodetected']) {
            this.RegError = "We're sorry, your number is not supported at this time. We hope to add your carrier in the future."
            this.forceUpdate();
          }
          console.log(response.data['available_operators'][0])
          console.log(response.data['packages'][0])
        })
        .catch(err => {
          this.RegError = "Invalid input. Please verify you entered a number with a valid country code and that all digits are correct.";
          this.forceUpdate();
          })
      this.handleOpenModal();
    }
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>        <label>
          <h4>Your Phone Number: </h4>
          <p>This phone number will not be shared with donors. You must include the country code (e.g., 1 for the United States of America). This must be a number capable of receiving mobile top-ups (e.g. you are paying for minutes and/or data).</p>
          <input name="pnum" type="text" value={this.state.pnum} onChange={this.onFieldChange('pnum').bind(this)} />
          <span style={{
          fontWeight: 'bold',
          color: 'red',
          }}>{this.pnumError}</span>
          </label>
          <label>
          <h4>Your Email Address: </h4>
          <p>This email address is required by our mobile topup vendor. We recommend you create a throwaway email address. This address will not be shared with users making donations.</p>
          <input name="email" type="text" value={this.state.email} onChange={this.onFieldChange('email').bind(this)} />
          <span style={{
          fontWeight: 'bold',
          color: 'red',
          }}>{this.emailError}</span>
          </label>
        <input type="submit" value="Submit" />
        <ReactModal 
           isOpen={this.state.showModal}
           contentLabel="Create your Code"
        >
          <br></br>
          <br></br>
          <span style={{
          fontWeight: 'bold',
          }}>{this.RegError}</span>
          <br></br>
          <button onClick={this.handleCloseModal}>Close</button>
        </ReactModal>
      </form>
    );
  }
}

export default function QuickStart({ isServerInfo }) {
  const { Moralis } = useMoralis();
  const { account, isAuthenticated } = useMoralis();

  if (!account || !isAuthenticated) {
    return (
      <div style={{ display: "flex", gap: "10px"}}>
        <Card
          style={styles.card}
          title={
            <>
              <Text strong>What is Donateti.me?</Text>
            </>
          }
        >
          <div style={{ display: "flex", width: "100%" }}>
            <img src={banner} alt="Donateti.me" />
          </div>
          <div style={{ display: "flex", width: "100%", alignContent: "center"}}>
            <img src={info} alt="Donateti.me Infographic" />
          </div>
        </Card>
        <Card
            style={styles.card}
            title={
              <>
                <Text strong>Send or Receive Airtime</Text>
              </>
            }
          >
            <div style={{ display: "flex", width: "50%", alignContent: "center", float: "right"}}>
              <img src={loginGraphic} alt="Donateti.me Login Prompt" />
            </div>
          </Card>
      </div>
    );
  } else {
    return (
      <div style={{ display: "flex", gap: "10px"}}>
        <Card
          style={styles.card}
          title={
            <>
              <Text strong>What is Donateti.me?</Text>
            </>
          }
        >
          <div style={{ display: "flex", width: "100%" }}>
            <img src={banner} alt="Donateti.me" />
          </div>
          <div style={{ display: "flex", width: "100%", alignContent: "center"}}>
            <img src={info} alt="Donateti.me Infographic" />
          </div>
        </Card>
        <Card
            style={styles.card}
            title={
              <>
                <Text strong>Send or Receive Airtime</Text>
              </>
            }
          >
            <div style={{ display: "inline", width: "100%", alignContent: "center"}}>
              <div style={{ display: "block", width: "100%"}}>
                <h2>I was given a Donateti.me Code</h2>
                <br></br>
                <PayForm />
              </div>
              <div style={{ display: "block", width: "100%"}}>
                <h2>I would like to start accepting Donateti.me Donations</h2>
                <br></br>
                <RegForm />
              </div>
            </div>
            <div style={{ display: "flex", width: "100%" }}>
              <img src={encouragement} alt="You're almost there!" />
            </div>
          </Card>
      </div>
    );
  }
}
