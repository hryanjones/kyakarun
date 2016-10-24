import minutesToHumanString from './minutesToHumanString';
import React, {Component} from 'react';

class App extends Component {
  constructor() {
    super();
      this.state = {};
    }

    render() {
      const {header, suggestion, resetSuggestion, setTime} = this.props;
      return (
        <div>
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
                <button className='choice' onClick={resetSuggestion}>
                  okay
                </button>
              </div>
            </div>
          :
            <form>
              {!time ? // haven't chosen a task yet something yet
                times.map(time =>
                  <label className='choice' key={time} onClick={() => setTime(time)}>
                    <input type='radio'/> {minutesToHumanString(time)}
                  </label>
                )
              :
                <button className='choice' onClick={resetSuggestion}>
                  try again
                </button>
              }
            </form>
          }
          {/*
            Make this so it works any any page. The only page it won't be visible on is the create/edit page itself
            <button className="create-todo single-button" onClick={() => this.setState({mode: 'create'})}>
              +
            </button>
          */}
        </div>;
      );
    }
header
suggestion
minutesToHumanString
