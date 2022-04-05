// Custom large text area cell editor for data submission ag-grid

import React from 'react';

import { ClickAwayListener } from '@material-ui/core';

import colors from '../../enums/colors';

class DSCellEditorTextArea extends React.Component {
  constructor(props) {
    const { getAuditReport, sheet } = props.context;
    const { rowIndex } = props;
    const { colId } = props.column;
    super(props);
    let auditReport = getAuditReport();
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
    return this.parseValue(this.state.value);
  }

  handleChange = (e) => {
    const { value } = e.target;

    let errors = this.props.context.auditCell(
      value,
      this.props.column.colId,
      this.props.rowIndex,
    );
    this.setState({ ...this.state, value, errors });
  };

  afterGuiAttached = () => {
    this.inputRef.current.focus();
    setTimeout(() => {
      this.setState({ ...this.state, attached: true });
    }, 20);
  };

  handleClickAway = () => {
    if (this.state.attached) {
      this.props.stopEditing();
    }
  };

  isPopup = () => true;

  render() {
    const { errors } = this.state;
    const { column, context } = this.props;

    const rowCount = context.textAreaLookup[column.colId];

    return (
      <div
        style={{
          margin: '0 auto',
          width: 'auto',
          padding: '12px',
          height: 'auto',
        }}
      >
        <ClickAwayListener onClickAway={this.handleClickAway}>
          <div>
            <textarea
              rows={rowCount}
              cols="70"
              spellCheck="false"
              ref={this.inputRef}
              value={this.state.value}
              onChange={this.handleChange}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: `1px solid ${colors.primary}`,
                borderRadius: '2px',
                padding: '2px 6px',
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

export default DSCellEditorTextArea;
