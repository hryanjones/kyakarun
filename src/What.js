import minutesToHumanString from './minutesToHumanString';
import idealTimesToTimes from './idealTimesToTimes';
import React, {Component} from 'react';

class What extends Component {
  constructor() {
    super();
    this.state = {
      rejected: {}, // used to remove choices that have been rejected
      time: null, // selected idealTime
    };
    this._resetSuggestion = this._resetSuggestion.bind(this);
    this._rejectSuggestion = this._rejectSuggestion.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    const {time} = this.state;
    if (!time && nextState.time) {
      this.setState({rejected: {}}); // reset rejected tasks to none
    }
  }

  render() {
    const {activites, idealTimes} = this.props;
    const {rejected, time} = this.state;
    const times = idealTimesToTimes(idealTimes);

    let suggestion;
    if (time) {
      suggestion = _getSuggestion(time, idealTimes, activites, rejected);
    }

    return (
      <div>
        <h1>{_getHeader(times, time, suggestion, rejected)}</h1>
        {suggestion ?
          <div className='container'>
            <h2>{suggestion}</h2>
            <p className='container'>
              it's good to do this for {minutesToHumanString(time)} or so
            </p>
            <div className='choices'>
              {/* TODO
              <button className='choice'>naw</button>
              <button className='choice'>can't</button>
              */}
              <button className='choice' onClick={() =>
                  this._rejectSuggestion(suggestion)
                }>
                not now
              </button>
              <button
                className='choice'
                onClick={this._resetSuggestion}
                // TODO improve so this logs a time on the activity
                // also want it to go to a screen where there's a timer to the end of the activity
                >
                okay
              </button>
            </div>
          </div>
        :
          <form>
            {!time ? // haven't chosen a task yet
              times.map(t =>
                <label className='choice' key={t} onClick={() => this.setState({time: t})}>
                  <input type='radio'/> {minutesToHumanString(t)}
                </label>
              )
            :
              <button className='choice' onClick={this._resetSuggestion}>
                try again
              </button>
            }
          </form>
        }
      </div>
    );
  }

  _resetSuggestion() {
    this.setState({rejected: {}, time: null});
  }

  _rejectSuggestion(suggestionName) {
    const {rejected} = this.state;
    rejected[suggestionName] = true; // mutating, but meh
    this.setState({rejected});
  }
}

function _getSuggestion(time, idealTimes, activities, rejected) {
  const possibleActivityNames = Object.keys(idealTimes[time] || {}).filter(name => (!(name in rejected)));
  console.log('possibleActivityNames', possibleActivityNames)
  const choiceIndex = Math.floor(Math.random() * possibleActivityNames.length);
  return possibleActivityNames[choiceIndex];
}

function _getHeader(times, time, suggestion, rejected) {
  if (!times.length) {
    return 'No things to do, create one';
  }
  if (!time) {
    return 'How long do you have?';
  }
  if (!suggestion) {
    return 'I\'m all out of options :(';
  }

  const numRejected = Object.keys(rejected).length;
  if (!numRejected) { // first suggestion
    return 'Maybe do this?';
  }
  if (numRejected === 1) { // second
    return 'okay, what about this?';
  }
  return 'hmm, maybe this?'; // all others
}

export default What;
