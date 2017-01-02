import minutesToHumanString from './minutesToHumanString';
import React from 'react';

class Activity extends React.Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
  }
  render() {
    const {name, data, archived, toggle, edit} = this.props;
    const {idealTime} = data;
    return (
      <li className='activity'>
        <label>
          <input type='checkbox' style={{display: 'none'}}/>{/* for showing/hiding actions */}

          <div className='activity-data flex-space-between' style={{alignItems: 'baseline'}}>
            <div className='activity-name'>
              {name}
            </div>
            <div>
              ({minutesToHumanString(idealTime, 'shorten please')})
            </div>
          </div>

          <div className='activity-actions'>
              <button onClick={() => toggle(name)}>
                  {archived ? 'un' : ''}archive
              </button>
              {!archived ?
                <button onClick={() => edit(name)}>
                  edit
                </button>
              : null}
          </div>
        </label>
      </li>
    );
  }
}

export default Activity;
