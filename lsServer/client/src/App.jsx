/*global chrome*/
import React, { Component } from 'react';
import io from 'socket.io-client';
import {FormGroup, FormControl, Button, InputGroup, Glyphicon} from 'react-bootstrap';
import './App.css';

class App extends Component{

  constructor(props){
    super(props);

    this.state = {
      username:'kegarc',
      message:'',
      newMessage:[],
      videoSrc:null,
      extensionID:'phcjipimfgbpejhapljnefkibgdanngb',
      sources: [ 'window', 'screen', 'tab' ],
      stream:null,
      imgSrc:'',
      intervalID:'',
    }

    this.socket = io("localhost:8000");

//******************* SEND MESSAGES TO SERVER ***********************//
    this.socket.on('RECEIVE_MESSAGE', function(data){
      addMessage(data);
    });

    const addMessage = data => {
      this.setState({newMessage: [...this.state.newMessage, data]})
      //this.setState({newText: data.text});
    }

    this.sendMessage = () => {
      //ev.preventDefault();
      this.socket.emit('SEND_MESSAGE', {
        author: this.state.username,
        message: this.state.message,
      });
      this.setState({message:''})
    }

//*****************SEND STREAM TO SERVER***********//
    this.socket.on("BESTREAM", function(video){
      imgstrm(video);
    });

    const imgstrm = (video) => {
      this.setState({imgSrc: video});
    }

    this.viewVideo = (video, context, canv) => {
      /*console.log(video);*/
    	context.drawImage(video, 0, 0, context.width, context.height);
    	this.socket.emit("FESTREAM", canv.toDataURL("image/webp"));
    }

  }

  componentDidMount(){
    const test = this.refs.karen;
    test.classList.remove('hidden');
  }

  scrollToBottom(){
    this.MessagesEnd.scrollIntoView({behavior: "smooth"});
  }

  componentDidUpdate(){
    this.scrollToBottom()
  }

  startScreenCap(){
    const request = this.state.sources;
    const extID = this.state.extensionID;
    let stream;

    chrome.runtime.sendMessage(extID, request, (response) => {
      if (response && response.type === 'success'){
        navigator.mediaDevices.getUserMedia({
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: response.streamId,
            }
          }
        }).then((returnedStream) => {
          stream = returnedStream;
          this.setState({stream: stream});
          this.setState({videoSrc: window.URL.createObjectURL(stream)});
        }).catch((err) => {
          console.log('could not get stream:', err)
        });
      }
    });
  }

  stopScreenCap(){
    let stream = this.state.stream;
    stream.getTracks().forEach(track => track.stop());
    this.setState({videoSrc:''});
  }

  startStream(){
    const canv = this.refs.canva;
    const context = canv.getContext("2d");
    const video = this.refs.vid;
    const freq = 4;
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
    context.width = canv.width;
    context.height= canv.height;

    let int = setInterval(()=>{this.viewVideo(video, context, canv)}, freq);
    this.setState({intervalID: int});
  }

  stopStream(){
    clearInterval(this.state.intervalID);
    this.setState({imgSrc:''});
  }


  render(){
    return(
      <div className="Main-Container">
        <div className="Title-Container">
          <div className="Title-Container-Screen">
            Shadow
          </div>

          <div className="Title-Container-Img" ref = "karen">
            <img src={require('./screen_share_BW.png')} className="title-img" alt=""/>
          </div>

          <div className="Title-Container-Share">
            Play
          </div>

         </div>

        <div className ="Video-Container">
            <div className="Video1-Container">

                <div className="Video1">

                  {
                    ((this.state.videoSrc === null) || (this.state.videoSrc ==='')) ?
                    <div className="Video1-Message">To Share Your Screen Press Start</div>:
                        <video
                          ref="vid"
                          src ={this.state.videoSrc}
                          autoPlay
                          width="450" height="450"
                          className="screen-cap-vid"
                        />
                  }
                </div>
                <div className="Video1-btns">
                  <div className="Video1-btn1">
                    <Button className="btn-info" onClick={this.startScreenCap.bind(this)}> <Glyphicon glyph ="play"/> Start Capture </Button>
                  </div>

                  <div className="Video1-btn2">
                    <Button className="btn-info" onClick={this.stopScreenCap.bind(this)}> <Glyphicon glyph ="stop"/> Stop Capture </Button>
                  </div>
                </div>
            </div>

            <div className="Video2-Container">
              <div className="Video2">
                <canvas ref="canva" style={{display: 'none'}}></canvas>
                {
                  (this.state.imgSrc === '') ?
                  <div className="Video2-Message">To Recieve Stream press Start</div>:
                  <div className = "Stream-Image"><img alt="" src={this.state.imgSrc} className ="strm-img"/></div>
                }
              </div>

              <div className="Video2-btns">
                <div className="Video2-btn1">
                  <Button className="btn-info" onClick={()=>{this.startStream()}}> <Glyphicon glyph ="play"/> Start Stream </Button>
                </div>

                <div className="Video2-btn2">
                  <Button className="btn-info" onClick={()=>{this.stopStream()}}> <Glyphicon glyph ="stop"/> Stop Stream </Button>
                </div>
              </div>
           </div>
       </div>

       <div className="Messages-Container">
         <div className="Message-Scrollbox">
          {
            (this.state.newMessage === []) ? <div> ' ' </div> :
            (this.state.newMessage.map((message, index) => {
              return(
                <div key={index} className="mssg">

                  <div className ="usernm"><em>{message.author}</em>:</div> {message.message}
                </div>
                )
              })
            )
          }
          <div ref={(el) => {this.MessagesEnd = el}}></div>
          </div>

          <div>
          <form>
            <div className="Message-Input-Box">
              <FormGroup>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder="Enter text here"
                    value={this.state.message}
                    onChange={(event)=>{this.setState({message:event.target.value})}}
                    onKeyPress ={event => {
                      if(event.key === "Enter") {
                        this.sendMessage()
                        event.preventDefault();
                      }
                    }}
                  />
                  <InputGroup.Button>
                    <Button className= "btn-info" onClick={this.sendMessage}> Send Message</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </div>
          </form>
          </div>
          </div>
      </div>
    );
  }

}

export default App;
