// Libs
import React from 'react';
import LocalStorageMixin from 'react-localstorage';

// components
import './App.css';
import Activities from './Activities';
import EditActivity from './EditActivity';
import What from './What';
import About from './About';
import Settings from './Settings';

// helpers
import minutesLeftInActivity from './minutesLeftInActivity';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      activities: {}, // main store of activities -> LocalStorage

      // create -> create a new activity or edit an existing one
      // what -> what to do now?
      // list -> list the activities (edit is also accessible from here, maybe also from a suggested task in future)
      mode: 'what',
      archived: {}, // this is where we store things that are done or deleted

      activityName: null, // if an activity is chosen or is being edited it'll be saved here until replaced or reset
      activityStartTime: null, // ISO8601 string timestamp of activity start for displaying time left (and resetting when that gets to 0)
      settings: {}, // key value store of settings, all should default to false
    };

    this.componentDidMount = LocalStorageMixin.componentDidMount.bind(this);
    this.componentWillUpdate = LocalStorageMixin.componentWillUpdate.bind(this);

    [
      '_updateActivity',
      '_toggleArchived',
      'addActivityConstraint',
      '_reset',
      '_setActiveActivity',
      '_toggleMenu',
      '_updateSettings',
    ]
    .forEach(fcn => {
      this[fcn] = this[fcn].bind(this);
    });
  }

  getStateFilterKeys() {
    return ['activities', 'archived', 'activityName', 'activityStartTime', 'settings'];
  }

  componentDidUpdate() {
    if (this.state.mode === 'create' && this.refs.activityName) { // when we're creating/editing
      this.refs.activityName.select(); // put focus in the activity's name box
    }
  }

  render() {
    const {activityName, activityStartTime, activities, archived, mode, settings} = this.state;

    let body;

    const minutesLeft = minutesLeftInActivity(activityName, activities, activityStartTime);

    if (mode === 'about') {
      body = <About/>;
    }
    else if (mode === 'settings') {
      body = <Settings settings={settings} updateSettings={this._updateSettings}/>;
    }
    else if (mode === 'menu') {
      body = <ul className='menu'>
        <li onClick={() => this.setState({mode: 'list'})}>
          List activities
        </li>
        <li onClick={() => this.setState({mode: 'settings'})}>
          Settings
        </li>
        <li onClick={() => this.setState({mode: 'about'})}>
          About
        </li>
      </ul>;
    }
    else if (minutesLeft > 0) {
      body = <TimeLeft
        activityName={activityName}
        activities={activities}
        startTime={activityStartTime}
        reset={this._reset}
      />;
    }
    else if (mode === 'what') {
      body = <What
        activities={activities}
        addActivityConstraint={this.addActivityConstraint}
        acceptSuggestion={this._setActiveActivity}
        settings={settings} // so can pass mixUpwards, mixDownwards
      />;
    }
    else if (mode === 'create') {
      body = (
        <EditActivity
          activities={activities}
          archived={archived}
          activityToEdit={activityName}
          updateActivity={this._updateActivity}
        />
      );
    }
    else if (mode === 'list') {
      body = <Activities
        activities={activities}
        archived={archived}
        toggle={this._toggleArchived}
        edit={name => this.setState({mode: 'create', activityName: name})}
      />;
    }

    return (
      <div className='App'>
        <div className='header'>
          {mode === 'what' && minutesLeft <= 0 ?
            <button
              className='activities-list'
              onClick={this._toggleMenu}
              >
              ☰
            </button>
          :
            <button className='cancel' onClick={this._reset}>
              ↩
            </button>
          }
          Kya Karun
        </div>

        <div className='body'>
          {body}
        </div>
        {mode !== 'create' && minutesLeft <= 0 && mode !== 'menu' ?
          <button
            className='create-todo single-button primary'
            onClick={() => this.setState({mode: 'create', activityName: null})}
            >
            +
          </button>
        : null}
      </div>
    );
  }

  _setTime(time) {
    this.setState({time});
  }

  _updateActivity(name, idealTime, oldName) {
    const {activities} = this.state;
    const newActivities = Object.assign({}, activities);

    if (!oldName) { // creating a new activity
      newActivities[name] = {idealTime, created: getNowISOString()};
    } else {
      // updating an existing activity
      const activity = activities[oldName];
      newActivities[name] = Object.assign({}, activity, {idealTime, updated: getNowISOString()});
      if (name !== oldName) {
        delete newActivities[oldName];
      }
    }

    this.setState({
      activities: newActivities,
      mode: 'what',
      time: null,
      activityName: null,
    });
  }

  // wow it is really hard to update a constraint in a non-mutating way :(
  addActivityConstraint(name, newConstraint) {
    let {activities} = this.state;
    let activity = activities[name];
    if (!activity) {
      throw new Error('No activity to add a constraint to for the given activity name: ' + name);
    }
    const constraints = Object.assign({}, activity.constraints);
    constraints[newConstraint] = true;
    activity = Object.assign({}, activity, {constraints});
    activities = Object.assign({}, activities, {[name]: activity});
    this.setState({activities});
  }

  _toggleArchived(name) {
    const {activities, archived} = this.state;
    const activity = activities[name];
    const archivedActivity = archived[name];
    const newActivities = Object.assign({}, activities);
    const newArchived = Object.assign({}, archived);
    if (activity) { // archive it
      newArchived[name] = activity;
      delete newActivities[name];
    }
    if (archivedActivity) {
      newActivities[name] = archivedActivity;
      delete newArchived[name];
    }
    this.setState({activities: newActivities, archived: newArchived});
  }

  _toggleMenu() {
    let {mode} = this.state;
    mode = mode === 'menu' ? 'what' : 'menu';
    this.setState({mode});
  }

  _reset() {
    this.setState({mode: 'what', activityName: null, activityStartTime: null});
  }

  _setActiveActivity(activityName) {
    const activityStartTime = getNowISOString();
    this.setState({activityName, activityStartTime});
  }

  _updateSettings(newSettings) {
    const {settings} = this.state;
    this.setState({
      settings: Object.assign({}, settings, newSettings)
    });
  }
}

// generally need Dates to be strings so they can be JSONified in local storage
function getNowISOString() {
  return (new Date()).toISOString();
}


export default App;

