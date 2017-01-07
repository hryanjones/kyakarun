import minutesToHumanString from './minutesToHumanString';
import React from 'react';

class Settings extends React.Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
  }

  render() {
    // const {settings, updateSettings} = this.props;

    return (
      <div>
        Here's where settings go.
      </div>
    );
  }
}

export default Settings;
