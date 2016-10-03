import React, {Component} from 'react';
// import moment from 'moment';
import './App.css';
import LocalStorageMixin from 'react-localstorage';

// SIMPLER! name & time only
const TODOS = [
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
      // todos: [],
      todos: TODOS,
      mode: 'what',
      time: null,
      rejected: [], // this will be used to remove choices that don't work
    };

    this.componentDidMount = LocalStorageMixin.componentDidMount.bind(this);
  }

  getStateFilterKeys() {
    return ['todos'];
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.time && nextState.time && nextState.rejected.length) {
      this.setState({rejected: []}); // reset rejected tasks to none
    }
    LocalStorageMixin.componentWillUpdate.bind(this)(nextProps, nextState);
  }

  componentDidUpdate() {
    if (this.state.mode === 'create' && this.refs.newTodoName) {
      this.refs.newTodoName.select();
    }
  }

  render() {
    const {todos, mode, time, rejected} = this.state;

    const possibleTimesMap = {};
    let possibleTimes = [];
    todos.forEach(todo => {
      let t = todo.idealTime;
      possibleTimesMap[t] = t;
    });
    Object.keys(possibleTimesMap).forEach(i => {
      let t = possibleTimesMap[i];
      possibleTimes.push(t);
    })
    possibleTimes = possibleTimes.sort((a, b) => a - b);
    // almost definitely a more efficient way to do this, but this is least code for now

    let header = 'How long do you have?';
    let suggestion, body;
    if (!todos.length) {
      header = 'No things to do, create one.';
    } else if (time) {
      console.log('time', time)
      header = 'Maybe do this?';
      suggestion = _getSuggestion(time, todos, rejected);
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
      * local storage<br/>
      * Have list of times: 5 mins or less, 15 mins, 30 mins, 1 hours or more hours<br/>
      * Make it so you can add 1-time & recurring things<br/>
      * Each thing should have a time range associated with it (any by default)<br/>
      * Has to be really easy to add a task (big + always visible on bottom right)<br/>
      <br/>
      # Nice to have<br/>
      * Tell the browser to cache the site
      * notification on the top (have to allow site to send notifications)<br/>
      * logo<br/>
    </div>;

    switch(mode) {
      case 'what': // should use nice fancy keymirror for this maybe
        body = <div>
          <h1>{header}</h1>
          {suggestion ?
            <div className='container'>
              <h2>{suggestion.name}</h2>
              <p className='container'>it's good to do this for {suggestion.idealTime} minutes or so</p>
              <div className='choices'>
                {/*
                <button className='choice'>naw</button>
                <button className='choice'>can't</button>
                */}
                <button className='choice' onClick={() =>
                    this.setState({rejected: rejected.concat([suggestion])})
                  }>
                  not now
                </button>
                <button className='choice' onClick={this._reset.bind(this)}>
                  okay
                </button>
              </div>
            </div>
          :
            <form>
              {!time ?
                possibleTimes.map(t =>
                  <label className='choice' key={t} onClick={() => this.setState({time: t})}>
                    <input type='radio'/>
                    {t} minutes
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
              <input ref='newTodoName' placeholder='name thing to do' type='text'/>
            </label>
            <label>
              Ideal time for activity:
              <select ref='newTodoTime'>
                <option>-- select a duration --</option>
                {TIME_BREAK_POINTS.map(minutes =>
                  <option key={minutes} value={minutes}>{minutes} minutes</option>
                )}
              </select>
            </label>
          </div>
          <button onClick={this._createNewTodo.bind(this)}>create</button>
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
            ✕
          </button>
        : null}
        <link href="https://cdn.jsdelivr.net/semantic-ui/2.2.4/semantic.min.css"/>
        {body}
      </div>
    );
  }

  _reset() {
    this.setState({time: null, rejected: []});
  }

  _createNewTodo() {
    const name = this.refs.newTodoName.value;
    const idealTime = parseInt(this.refs.newTodoTime.value, 10);
    if (!name || !idealTime || isNaN(idealTime)) {
      // TODO show validation in the UI
      return;
    }
    this.setState({
      mode: 'what',
      time: null,
      rejected: [],
      todos: this.state.todos.concat([{name, idealTime}])
    });
  }
}

function _getSuggestion(time, todos, rejected) {
  console.log('todos', todos)
  const possibleTodos = todos.filter(todo => {
    // console.log('todo.name', todo.name)
    return todo.idealTime === time && !rejected.some(t => t === todo)
  });
  console.log('possibleTodos', possibleTodos)
  const choiceIndex = Math.floor(Math.random() * possibleTodos.length);
  return possibleTodos[choiceIndex];
}

function isNaN(input) {
  return input !== input; // eslint-disable-line no-self-compare
}

export default App;

