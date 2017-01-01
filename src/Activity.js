import minutesToHumanString from './minutesToHumanString';
import React, {Component} from 'react';

class Activity extends Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
  }
  render() {
    const {name, data, archived, toggle, edit} = this.props;
    const {idealTime} = data;
    return (
      <li className='activity'>
        <div className='flex-space-between'>
            <div className='activity-data'>
              {name + ' '}
              ({minutesToHumanString(idealTime)})
            </div>
            <div>
                <button onClick={() => toggle(name)}>
                    {archived ? 'un' : ''}archive
                </button>
                {!archived ?
                  <button onClick={() => edit(name)}>
                    edit
                  </button>
                : null}
            </div>
        </div>
      </li>
    );
  }
}

export default Activity;
