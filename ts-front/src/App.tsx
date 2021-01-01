import React from 'react';
import './App.css';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import Init from './components/Init/Init';

const App = () => {
  return (
    <Router>
      <Route path="/" exact component={Init} />
    </Router>
  )
}

export default App;
