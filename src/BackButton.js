import React from 'react';

class BackButton extends React.Component {
  constructor() {
    super();
    this.state = null; // such stateless, wow
  }
  render() {
    const {props} = this;
    let {className} = props;
    className = (className || '') + ' single-button cancel';

    return (
      <button {...props} className={className}>
        <span>+</span>
      </button>
    );
  }
}

export default BackButton;
