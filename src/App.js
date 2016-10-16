import React, {Component} from 'react';
// import moment from 'moment';
import './App.css';
import LocalStorageMixin from 'react-localstorage';

const TODOS = [ // LEGACY
  // {name: 'Meditate', idealTime: 15},
  // {name: 'Twitter or Inoreader', idealTime: 5},
  // {name: 'Study Hindi', idealTime: 15},
  // {name: 'Stretch', idealTime: 15},
  // {name: 'Emails', idealTime: 30},
  // {name: 'Listen to Alan Watts', idealTime: 30},
  // {name: 'Do some push ups', idealTime: 5},
];

const TIME_BREAK_POINTS = [
  5,
  15,
  30,
  60,  // 1 hr
  90,  // 1 hr 30 mins
  120, // 2 hrs
];

class App extends Component {
  constructor() {
    super();
    this.state = {
      todos: TODOS, // LEGACY
      activities: {}, // main store of activites -> LocalStorage

      // this is actually an object of objects first key is ideal time minutes, second key is activity name
      idealTimes: {}, // idealTime (minutes) to activity name lookup -> LocalStorage

      // create -> create a new task (should be able to edit soon too)
      // what -> what to do now?
      mode: 'what',
      time: null, // selected idealTime
      rejected: {}, // used to remove choices that have been rejected
      archived: {}, // TODO (not used yet) this is where we store things that are done or deleted
    };

    this.componentDidMount = LocalStorageMixin.componentDidMount.bind(this);
  }

  getStateFilterKeys() {
    return ['todos', 'activities', 'idealTimes'];
  }

  componentWillUpdate(nextProps, nextState) {
    const {time, todos} = this;
    if (!time && nextState.time && nextState.rejected.length) {
      this.setState({rejected: {}}); // reset rejected tasks to none
    }
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
    const {todos, activites, idealTimes, mode, time, rejected} = this.state;

    const times = Object.keys(idealTimes)
      .map(t => parseInt(t, 10)) // make sure it's an int (object keys are strings, I think)
      .sort((a, b) => a - b); // sort numerically instead of alphabetically

    let header = 'How long do you have?';
    let suggestion, body;
    if (!times.length) {
      header = 'No things to do, create one.';
    } else if (time) {
      header = 'Maybe do this?';
      suggestion = _getSuggestion(time, idealTimes, activites, rejected);
      if (!suggestion) {
        header = 'I\'m all out of options :(';
      } else {
        if (rejected.length === 1) {
          header = 'okay, what about this?';
        } else if (rejected.length > 1) {
          header = 'hmm, maybe this?';
        }
      }
      console.log('suggestion', suggestion)
      console.log('rejected', rejected)
    }

    const devTODOs = <div className="TODOs">
      # YOU"RE IN A WEIRD STATE, HERE ARE THE TODOS FOR THIS APP<br/>
      <br/>
      # TODO<br/>
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

    switch(mode) {
      case 'what': // should use nice fancy keymirror for this maybe
        body = <div>
          <h1>{header}</h1>
          {suggestion ?
            <div className='container'>
              <h2>{suggestion.name}</h2>
              <p className='container'>it's good to do this for {minutesToHumanString(time)} or so</p>
              <div className='choices'>
                {/* TODO
                <button className='choice'>naw</button>
                <button className='choice'>can't</button>
                */}
                <button className='choice' onClick={() => {
                    rejected[suggestion.name] = true; // yup, don't care that I'm mutating :(
                    this.setState({rejected});
                  }}>
                  not now
                </button>
                <button className='choice' onClick={this._reset.bind(this)}>
                  okay
                </button>
              </div>
            </div>
          :
            <form>
              {!time ? // haven't chosen a task yet something yet
                times.map(time =>
                  <label className='choice' key={time} onClick={() => this.setState({time})}>
                    <input type='radio'/> {minutesToHumanString(time)}
                  </label>
                )
              :
                <button className='choice' onClick={this._reset.bind(this)}>
                  try again
                </button>
              }
            </form>
          }
          <button className="create-todo single-button" onClick={() => this.setState({mode: 'create'})}>
            +
          </button>
        </div>;
        break;
      case 'create':
        body = <div>
          <h2>
            New activity
          </h2>
          <div>
            <label>
              Name:
              <input ref='activityName' placeholder='name thing to do' type='text'/>
            </label>
            <label>
              Ideal time for activity:
              <select ref='activityIdealTime'>
                <option>-- select a duration --</option>
                {TIME_BREAK_POINTS.map(minutes =>
                  <option key={minutes} value={minutes}>{minutesToHumanString(minutes)}</option>
                )}
              </select>
            </label>
          </div>
          <button onClick={this._createNewActivity.bind(this)}>create</button>
        </div>
        break;
      default:
        body = devTODOs;
    }

    return (
      <div className="App">
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

  _reset() {
    this.setState({time: null, rejected: []});
  }

  _createNewActivity() {
    const {activities, idealTimes} = this.state;
    const {activityName, activityIdealTime} = this.refs;
    const name = activityName.value;
    const idealTime = parseInt(activityIdealTime.value, 10);
    const activityAlreadyExists = Boolean(activites[name]);
    if (!name || !idealTime || !Number.isFinite(idealTime) || activityAlreadyExists) {
      // TODO show validation in the UI
      return;
    }

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

function _getSuggestion(time, idealTimes, activities, rejected) {
  const possibleActivityNames = Object.keys(idealTimes[time] || {}).filter(name => (!name in rejected));
  console.log('possibleActivityNames', possibleActivityNames)
  const choiceIndex = Math.floor(Math.random() * possibleActivityNames.length);
  return possibleActivityNames[choiceIndex];
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

function minutesToHumanString(minutes) {
  if (Number.isFinite(minutes)) {
    throw new Error('`minutes` should be a finite number. You gave: ' + minutes);
  }
  if (minutes < 60) {
    return minutes + ' minutes';
  }
  const hours = Math.floor(minutes / 60);
  return [
    hours,
    hours === 1 ? 'hour' : 'hours',
    minutes % 60,
    'minutes',
  ].join(' ');
}

export default App;

