import React from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';
import Game from './pages/Game';
import Login from './pages/Login';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Switch>
      <Route exact path="/" render={ (props) => <Login { ...props } /> } />
      <Route path="/games" component={ Game } />
      <Route path="/settings" component={ Settings } />
    </Switch>
  );
}
