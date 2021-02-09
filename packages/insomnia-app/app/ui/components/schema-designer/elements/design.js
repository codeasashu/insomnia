import * as React from 'react';

class Row extends React.PureComponent {
  render() {
    const { children } = this.props;
    return <div className="row">{children}</div>;
  }
}

class Col extends React.PureComponent {
  render() {
    const { children } = this.props;
    return <div className="col">{children}</div>;
  }
}

export { Row, Col };
