// Custom standard cell editor for datasubmission ag-grid

import React from 'react';

import { ClickAwayListener } from '@material-ui/core';
import { withStyles, Tooltip } from '@material-ui/core';

const styles = (theme) => ({
  container: {
    // maxWidth: '175px',
    // margin: '0 auto',
  },
  input: {
    backgroundColor: 'transparent',
    color: 'white',
    height: '28px',
    border: '1px solid rgb(157, 209, 98)',
    borderRadius: '2px',
    padding: '2px 6px',
    width: '100%',
  },
  errors: {
    lineHeight: 1.2,
    margin: '6px auto',
    textAlign: 'left',
    maxWidth: '100%',
    whiteSpace: 'pre-wrap',
  },
});

class DSCellEditor extends React.Component {
  constructor(props) {
    const { context, rowIndex, column, parseValue, value = '' } = props;
    const { getAuditReport, sheet } = context;
    const { colId } = column;
    const auditReport = getAuditReport();
    const errors =
      auditReport[sheet][rowIndex] && auditReport[sheet][rowIndex][colId]
        ? auditReport[sheet][rowIndex][colId]
        : [];

    super(props);

    this.inputRef = React.createRef();
    this.parseValue = parseValue;
    this.state = {
      value,
      errors,
      // attached: false,
    };
  }

  getValue() {
    return this.state.value;
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

  // afterGuiAttached = () => {
  //   this.inputRef.current.focus();
  //   this.inputRef.current.select();
  //   setTimeout(() => {
  //     this.setState({ ...this.state, attached: true });
  //   }, 1);
  // };

  handleClickAway = () => {
    if (this.state.attached) {
      this.props.stopEditing();
    }
  };

  render() {
    const { errors = [] } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <ClickAwayListener onClickAway={this.handleClickAway}>
          <div>
            <input
              spellCheck="false"
              ref={this.inputRef}
              value={this.state.value}
              onChange={this.handleChange}
              className={classes.input}
            />
            {errors.map((err, i) => (
              <p key={i} className={classes.errors}>
                {err}
              </p>
            ))}
          </div>
        </ClickAwayListener>
      </div>
    );
  }
}

export default withStyles(styles)(DSCellEditor);
