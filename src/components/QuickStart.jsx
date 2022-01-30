import { Card, Typography } from "antd";
import React, {useState} from "react";
import { useMoralis, useMoralisFile } from "react-moralis";
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

function GetAmount(props) {
  const [amount, setAmount] = useState();
  const Moralis = require('moralis');
  const handleGet = async () => {
    var ourCode = props.code;
    const params =  { code: ourCode };
    const res = await Moralis.Cloud.run("getAmount", params);
    const status = await axios.get('https://api.covalenthq.com/v1/pricing/tickers/?quote-currency=USD&format=JSON&key=ckey_23ecd94f0d744665b9b223b9604');
    console.log(res)
    const tokens = status.data.data.items;
    const ethQuote = tokens[0]["quote_rate"];
    const ethRate = 1/ethQuote;
    const ethPrice = ethRate * res;
    const btcQuote = tokens[13]["quote_rate"];
    const btcRate = 1/btcQuote;
    const btcPrice = btcRate * res;
    if (res === 0) {
      setAmount("This code is not associated with any known user");
    } else {
      setAmount("This receiver can accept a donation of $" + res +" (USD). That is an estimated " + ethPrice.toFixed(9) + " ETH or " + btcPrice.toFixed(9) + " BTC");
    }
  };
  return (
    <>
      <div>
        <h2>Amount for Donation</h2>
        <h2>Get estimated donation amounts before continuing</h2>
        <button
          onClick={() => handleGet()}
        >Get current estimates
        </button>
        <br></br>
        <p>{amount}</p>
      </div>
    </>
  );
}

class PayForm extends React.Component {
  constructor(props) {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    var defaultInput = params.get('token');
    if (defaultInput == null) {
      defaultInput = "";
    }
    super(props);
    this.state = {value: defaultInput, showModal: false};
    this.payError = ""
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.showAmount = false;
  }

  handleChange(event) {    this.setState({value: event.target.value});  }
  handleOpenModal () {
    this.setState({ showModal: true });
  }
  handleCloseModal () {
    this.setState({ showModal: false });
  }
  handleSubmit(event) {
    var invalidInput = false;
    if (!validator.isUUID(this.state.value, 4)) {
      this.payError = "Improperly formatted code, please check your input and try again.";
      invalidInput = true;
    }
    if (invalidInput) {
      this.forceUpdate();
    } else {
      this.payError = "";
      this.forceUpdate();
      this.showAmount = true;
    }
    this.handleOpenModal();
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>        <label>
          <input type="text" value={this.state.value} onChange={this.handleChange} />        </label>
        <input type="submit" value="Submit" />
        <ReactModal 
           isOpen={this.state.showModal}
           contentLabel="Donate Airtime"
        >
          <br></br>
          <br></br>
          <span style={{
          fontWeight: 'bold',
          color: 'red',
          }}>{this.payError}</span>
          <br></br>
          { this.showAmount ? <GetAmount code={this.state.value}/>: null}
          <br></br>
          <button onClick={this.handleCloseModal}>Close</button>
        </ReactModal>
      </form>
    );
  }
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function Save(props) {
  const {
    error,
    isUploading,
    moralisFile,
    saveFile,
  } = useMoralisFile();
  const { setUserData } = useMoralis();
  const [ipfsLink, setLink] = useState();
  const handleSave = () => {
    console.log("Saving");
    console.log(props);
    setUserData({
      email: props.email,
      phone: props.phone,
      operator: props.operator,
      amount: props.amount,
      uniqueID: props.uniqueID
    });
    var canvas = document.getElementById('clearwebQR')
    canvas.toBlob(function(blob) {
      console.log(blob);
      var QRUpload = saveFile(props.uniqueID + ".png", blob, { saveIPFS: true }).then(response => {
        console.log(response);
        setLink(response["_ipfs"]);
      });
    });
  };
  return (
    <>
      <div>
        <h2>Save (this will erase any previous Donateti.me codes for this account)</h2>
        <button
          onClick={() => handleSave()}
        >Confirm and Save
        </button>
        <br></br>
        Your Censorship-Resistant IPFS QR Code URL will be available after saving.
        <p>{ipfsLink}</p>
      </div>
    </>
  );
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
    this.uniqueID = "";
    this.phone = "";
    this.email = "";
    this.operator = "";
    this.amount = "";
    this.showSave = false;
    this.codeExplainer = "";
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
          var uniqueID = uuidv4();
          this.uniqueID = uniqueID;
          this.phone = this.state.pnum;
          this.email = this.state.email;
          this.operator = response.data['available_operators'][0]['slug'];
          this.amount = response.data['packages'][0]['amount'];
          var donateURL = "https://www.donateti.me/home/?token=" + uniqueID;
          var canvas = document.getElementById('clearwebQR')
          QRCode.toCanvas(canvas, donateURL, function (error) {
            if (error) console.error(error)
          })
          this.RegError = "";
          this.showSave = true;
          this.codeExplainer = "After saving, you can distribute this unique Donateti.me code which users can use on this website: "
          this.forceUpdate();
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
          <canvas id="clearwebQR"></canvas>
          { this.showSave ? <Save email={this.email} phone={this.phone} operator={this.operator} amount={this.amount} uniqueID={this.uniqueID}  /> : null }
          { this.showSave ? <span style={{fontWeight: 'bold',}}>{this.codeExplainer} {this.uniqueID}</span>: null}
          { this.showSave ? <p>You can request donations by distributing this QR code or by distributing this code. You must save in order to begin accepting donations.</p>: null}
          <br></br>
          <button onClick={this.handleCloseModal}>Close</button>
        </ReactModal>
      </form>
    );
  }
}

export default function QuickStart({ isServerInfo }) {
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
