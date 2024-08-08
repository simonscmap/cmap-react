// Custom standard cell editor for datasubmission ag-grid

import React from 'react';

import { ClickAwayListener } from '@material-ui/core';

class DSCellEditor extends React.Component {
  constructor(props) {
    const { getAuditReport, sheet } = props.context;
    const { rowIndex } = props;
    const { colId } = props.column;
    let auditReport = getAuditReport();

    super(props);
    this.inputRef = React.createRef();
    this.parseValue = props.parseValue;
    this.state = {
      value: props.value || '',
      errors:
        auditReport[sheet][rowIndex] && auditReport[sheet][rowIndex][colId]
          ? auditReport[sheet][rowIndex][colId]
          : [],
      attached: false,
    };
  }

  getValue() {
    return this.parseValue ? this.parseValue(this.state.value).newValue : this.state.value;
  }

  handleChange = (e) => {
    const { value } = e.target;

    let errors = this.props.context.auditCell(
      value,
      this.props.column.colId,
      this.props.rowIndex,
    );
    console.log ('changing cell value', value)
    this.setState({ ...this.state, value, errors });
  };

  afterGuiAttached = () => {
    this.inputRef.current.focus();
    this.inputRef.current.select();
    setTimeout(() => {
      this.setState({ ...this.state, attached: true });
    }, 1);
  };

  handleClickAway = () => {
    if (this.state.attached) {
      this.props.stopEditing ();
    }
  };

  render() {
    const { errors } = this.state;
    console.log ('cell editor errors', errors);

    console.log ('example parseValue', this.parseValue (this.state.value))

    return (
      <div
        style={{
          maxWidth: '175px',
          margin: '0 auto',
        }}
      >
        <ClickAwayListener onClickAway={this.handleClickAway}>
          <div>
            <input
              spellCheck="false"
              ref={this.inputRef}
              value={this.state.value}
              onChange={this.handleChange}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                height: '28px',
                border: `1px solid black`,
                borderRadius: '2px',
                padding: '2px 6px',
                maxWidth: '100%',
              }}
            />
            {errors.map((err, i) => {
              return (
                <p
                  key={i}
                  style={{
                    lineHeight: 1.2,
                    margin: '6px auto',
                    textAlign: 'left',
                    maxWidth: '100%',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {err}
                </p>
              );
            })}
          </div>
        </ClickAwayListener>
      </div>
    );
  }
}

export default DSCellEditor;
