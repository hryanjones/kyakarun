import React, {Component} from 'react';
import LocalStorageMixin from 'react-localstorage';
// import moment from 'moment';

import './App.css';
import Activities from './Activities';
import EditActivity from './EditActivity';
import What from './What';

class App extends Component {
  constructor() {
    super();
    this.state = {
      activities: {}, // main store of activities -> LocalStorage

      // this is actually an object of objects first key is ideal time minutes, second key is activity name

      // create -> create a new activity (should be able to edit soon too)
      // what -> what to do now?
      // list -> list the activities (edit will be accessible from here and also from a suggested task)
      mode: 'what',
      archived: {}, // this is where we store things that are done or deleted
    };

    this.componentDidMount = LocalStorageMixin.componentDidMount.bind(this);
    this.componentWillUpdate = LocalStorageMixin.componentWillUpdate.bind(this);
    this._updateActivity = this._updateActivity.bind(this);
    this._toggleArchived = this._toggleArchived.bind(this);
  }

  getStateFilterKeys() {
    return ['activities', 'archived'];
  }

  componentDidUpdate() {
    if (this.state.mode === 'create' && this.refs.activityName) { // when we're creating/editing
      this.refs.activityName.select(); // put focus in the activity's name box
    }
  }

  render() {
    const {activities, archived, mode} = this.state;

    let body, header;

    const devTODOs = <div>YOU'RE IN A WEIRD STATE</div>;

    if (mode === 'what') {
      body = <What activities={activities}/>;
    }
    else if (mode === 'create') {
      body = (
        <EditActivity
          activities={activities}
          archived={archived}
          updateActivity={this._updateActivity}
        />
      );
    }
    else if (mode === 'list') {
      body = <Activities
        activities={activities}
        archived={archived}
        toggle={this._toggleArchived}
      />;
    }
    else {
      body = devTODOs;
    }

    return (
      <div className="App">
        {header}
        {mode !== 'what' ? // back button
          <button
            onClick={() => this.setState({mode: 'what'})}
            className='single-button cancel'
            >
            <span>+</span>
          </button>
        : null}
        {body}
        {mode !== 'create' ?
          <button
            className="create-todo single-button"
            onClick={() => this.setState({mode: 'create'})}
            >
            +
          </button>
        : null}
        {mode !== 'list'  && (Object.keys(activities).length || Object.keys(archived).length) ?
          <button
            className="activities-list single-button"
            onClick={() => this.setState({mode: 'list'})}
            >
            ☰
          </button>
        : null}
      </div>
    );
  }

  _setTime(time) {
    this.setState({time});
  }

  _updateActivity(name, idealTime) {
    const {activities} = this.state;

    const created = getNowISOString();
    activities[name] = {created, idealTime};
    this.setState({
      mode: 'what',
      time: null,
      activities,
    });
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
}

// generally need Dates to be strings so they can be JSONified in local storage
function getNowISOString() {
  return (new Date()).toISOString();
}


export default App;

