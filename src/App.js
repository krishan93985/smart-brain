import React from 'react';
import './App.css';
import Particles from 'react-particles-js';
import Navbar from './components/Navbar/Navbar';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

const parameters={
  particles:{
    number:{
    value:80,
    density:{
      enable:true,
      value_area:800
    }
    }
  }
}

const initialState = {   //Better way for multiple users in a huge app
  input:'',
  imageUrl:'',
  faceArray:[],
  route:'signout',
  isSignedIn:false,
  user:{
    id:'',
    name:'',
    email:'',
    password:'',
    entries:0,
    date:''
  }
}

class App extends React.Component {
  constructor(){
    super();
    this.state=initialState;
  }

  calculateFaceBox = (DATA) => {
    const faces = DATA.outputs[0].data.regions.map(face => {
    const data = face.region_info.bounding_box;
    const image = document.getElementById('pic');
    const height = Number(image.height);
    const width = Number(image.width);
    return {
      topRow:height * data.top_row,
      bottomRow:height - (height * data.bottom_row),
      leftCol:width * data.left_col,
      rightCol:width - (width * data.right_col)
    }
  });
    this.setState({faceArray:faces});
  }

  loadUser = (data) => {
    this.setState({user:data});
  }

  onInputChange = (event) =>{
    this.setState({input:event.target.value});
  }
  
  onRouteChange = (route) => {
    if(route === 'signout')
    this.setState(initialState)
    else if(route === 'home')
    this.setState({isSignedIn:true})
    this.setState({route:route});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl:this.state.input});
    fetch('https://evening-castle-93461.herokuapp.com/imageurl',{
      method:'post',
      headers:{'Content-type':'application/json'},
      body:JSON.stringify({
        input:this.state.input
      })
    }).then(response => response.json())
    .then(response => {
      if(response)
      {
        fetch('https://evening-castle-93461.herokuapp.com/image',{
        method:'put',
        headers:{'Content-type':'application/json'},
        body:JSON.stringify({
        id:this.state.user.id
     }) 
    })
    .then(resp => resp.json())
    .then(resp => this.setState(Object.assign(this.state.user,{entries:resp})))
    .catch(error =>console.log(error));
    this.calculateFaceBox(response)
     }  
  })   
    .catch(error =>console.log(error));
    }

  render(){
    const { imageUrl,faceArray,route,isSignedIn,user} = this.state;
  return (
    <div className="App">
      <Particles className='particles' params={parameters}/>
      <Navbar onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
      {route === 'signout'?
      <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
     : (route === 'register')?
     <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
     :
      <div>
      <Logo/>
      <Rank name={user.name} entries={user.entries}/>
      <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
      <FaceRecognition url={imageUrl} faceArray={faceArray} facekey={user.id}/>
      </div>
      }
    </div>
  );
  }
}

export default App;
