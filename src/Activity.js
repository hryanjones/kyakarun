import minutesToHumanString from './minutesToHumanString';
import React, {Component} from 'react';

class Activity extends Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
  }
  render() {
    const {name, data} = this.props;
    const {idealTime} = data;
    return (
      <li className='activity'>
        <div className='flex-space-between'>
            <div className='activity-data'>
              {name + ' '}
              ({minutesToHumanString(idealTime)})
            </div>
            <div>
                <button onClick={() => this.props.toggle(name)}>
                    Archive
                </button>
                {/*Edit*/}
            </div>
        </div>
      </li>
    );
  }
}

export default Activity;
