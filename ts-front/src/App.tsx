import React from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.css"; // Import precompiled Bootstrap css

import { BrowserRouter as Router, Route } from 'react-router-dom';

import Init from './components/Init/init';
import Main from './components/Init/main';
import Game from './components/Game/game';

const App = () => {
  return (
    <>
      <Router>
        <Route path="/" exact component={Init} />
        <Route path="/home" exact component={Main} />
        <Route path="/game" exact component={Game} />
      </Router>
    </>
  )
}

export default App;
