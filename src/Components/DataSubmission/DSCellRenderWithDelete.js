// https://www.ag-grid.com/archive/20.2.0/javascript-grid-cell-rendering-components/

import React, {Component} from "react";

export default class DSCellRenderWithDelete extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  handler = (e) => {
    // e.preventDefault ();
    this.props.setValue (null);
  }

  render() {
    if (this.props.value || this.props.value === 0) {
      return (
        <span>
          {`${this.props.value}`}{' '}
        <button style={{height: 20, lineHeight: 0.5}} onClick={this.handler} className="btn btn-info">Clear</button>
        </span>
      )
    }
    return '';
  }
}
