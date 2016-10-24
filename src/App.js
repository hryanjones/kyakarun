import React, {Component} from 'react';
import LocalStorageMixin from 'react-localstorage';
// import moment from 'moment';

import './App.css';
import EditActivity from './EditActivity';
import What from './What';

import minutesToHumanString from './minutesToHumanString';

const TODOS = [ // LEGACY
  // {name: 'Meditate', idealTime: 15},
  // {name: 'Twitter or Inoreader', idealTime: 5},
  // {name: 'Study Hindi', idealTime: 15},
  // {name: 'Stretch', idealTime: 15},
  // {name: 'Emails', idealTime: 30},
  // {name: 'Listen to Alan Watts', idealTime: 30},
  // {name: 'Do some push ups', idealTime: 5},
];

class App extends Component {
  constructor() {
    super();
    this.state = {
      todos: TODOS, // LEGACY
      activities: {}, // main store of activites -> LocalStorage

      // this is actually an object of objects first key is ideal time minutes, second key is activity name
      idealTimes: {}, // idealTime (minutes) to activity name lookup -> LocalStorage

      // create -> create a new activity (should be able to edit soon too)
      // what -> what to do now?
      // list -> list the activities (edit will be accessible from here and also from a suggested task)
      mode: 'what',
      archived: {}, // TODO (not used yet) this is where we store things that are done or deleted
    };

    this.componentDidMount = LocalStorageMixin.componentDidMount.bind(this);
    this._updateActivity = this._updateActivity.bind(this);
  }

  getStateFilterKeys() {
    return ['todos', 'activities', 'idealTimes']; // LEGACY, remove todos
  }

  componentWillUpdate(nextProps, nextState) {
    const {todos} = this.state;
    LocalStorageMixin.componentWillUpdate.bind(this)(nextProps, nextState);

    // convert our array of TODOS to an object (to make it easier to edit and stuff)
    if (todos) { // LEGACY, can be deleted after 1st use
      const activities = {};
      const idealTimes = {};
      const created = getNowISOString();
      todos.forEach(todo => {
        const {idealTime, name} = todo;
        activities[name] = {created};
        addToIdealTimes(idealTimes, idealTime, name);
      });

      this.setState({todos: null, activites, idealTimes});
    }
  }

  componentDidUpdate() {
    // FIXME move creating/editing to a new component
    if (this.state.mode === 'create' && this.refs.activityName) { // when we're creating/editing
      this.refs.activityName.select(); // put focus in the activity's name box
    }
  }

  render() {
    const {todos, activites, idealTimes, mode, time} = this.state;

    const times = Object.keys(idealTimes)
      .map(t => parseInt(t, 10)) // make sure it's an int (object keys are strings, I think)
      .sort((a, b) => a - b); // sort numerically instead of alphabetically

    let body, header;
    if (!times.length) {
      header = <h1>No things to do, create one</h1>;
    }

    const devTODOs = <div className="TODOs">
      # YOU"RE IN A WEIRD STATE, HERE ARE THE TODOS FOR THIS APP<br/>
      <br/>
      # TODO<br/>
      * break things up into smaller components<br/>
      * use an object to store todos, I mean activites<br/>
      * do weighted choice... Array with values equal to object, repeats for higher priority, & result being the same object.<br/>
      * Also select tasks at next level up or down at smaller weighted rate<br/>
      * View & Edit existing tasks (delete goes to same place as done -> archive)<br/>
      * Timer screen when say "okay"<br/>
      * Make it so you can add 1-time & recurring things<br/>
      * ~~Has to be really easy to add a task (big + always visible on bottom right)~~<br/>
      * ~~Each thing should have a time range associated with it (any by default)~~<br/>
      * ~~local storage~~<br/>
      <br/>
      # Nice to have<br/>
      * notification on the top (have to allow site to send notifications)<br/>
      &npsp;&nbsp;* notifications would be for entering the app and saying what you're currently doing
      * Tell the browser to cache the site
      * logo<br/>
    </div>;

    if (mode === 'what') {
      body = <What activities={activities} idealTimes={idealTimes} />;
    }
    else if (mode === 'create') {
      body = <EditActivity activities={activities} updateActivity={this._updateActivity} />;
    }
    else {
      body = devTODOs;
    }

    return (
      <div className="App">
        {header}
        {mode !== 'what' ?
          <button
            onClick={() => this.setState({mode: 'what'})}
            className='single-button cancel'
            >
            X
          </button>
        : null}
        {body}
      </div>
    );
  }

  _setTime(time) {
    this.setState({time});
  }

  _updateActivity(name, idealTime) {
	  // FIXME need to move most of this to Edit Activity
    const {activities, idealTimes} = this.state;

    const created = getNowISOString();
    activities[name] = {created};
    addToIdealTimes(idealTimes, idealTime, name);
    this.setState({
      mode: 'what',
      time: null,
      rejected: {}, // reset for funsies
      activities,
      idealTimes,
    });
  }
}

function addToIdealTimes(idealTimes, idealTime, activityName) {
  if (!idealTimes || !idealTime || !activityName) {
    throw new Error('Hmmm, can\'t add to idealTimes with these inputs: ', idealTimes, idealTime, activityName);
  }
  idealTimes[idealTime] = idealTimes[idealTime] || {};
  idealTimes[idealTime][activityName] = true;
}

// generally need Dates to be strings so they can be JSONified in local storage
function getNowISOString() {
  return (new Date()).toISOString();
}


export default App;

