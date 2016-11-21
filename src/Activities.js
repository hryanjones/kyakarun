import React, {Component} from 'react';
import Activity from './Activity';

class Activities extends Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
    this._renderActivities = this._renderActivities.bind(this);
  }

  render() {
    const {activities, archived} = this.props;

    return (
      <div className='activities'>
        <h1>Activities</h1>
        {this._renderActivities(activities)}
        {Object.keys(archived).length ?
          <div className='archived'>
            <h2>Archived activities</h2>
            {this._renderActivities(archived, {archived: true})}
          </div>
        : null}
      </div>
    );
  }

  _renderActivities(activities, props={}) {
    const {toggle} = this.props;
    return (
      <ul>
        {Object.keys(activities).map(name => {
          const data = activities[name];
          props = Object.assign(props, {name, data, toggle, key: name});
          return (<Activity {...props}/>);
        })}
      </ul>
    );
  }
}

Activities.defaultProps = {
  activities: {},
  archived: {},
};


export default Activities;