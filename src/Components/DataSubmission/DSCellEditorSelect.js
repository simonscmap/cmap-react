import React from 'react';

import { ClickAwayListener } from '@material-ui/core';

import colors from '../../Enums/colors';

class DSCellEditorSelect extends React.Component {
    constructor(props){
        const { getAuditReport, sheet } = props.context;
        const { rowIndex } = props;
        const { colId } = props.column;
        let auditReport = getAuditReport();
        super(props);
        this.inputRef = React.createRef();
        this.parseValue = props.parseValue;
        let checkAgainst = new Set(props.context.selectOptions[colId]);
        let value = props.value ? props.value.toLowerCase() : '';
        value = checkAgainst.has(value) ? value : '';
        this.state = {
            value,
            errors: auditReport[sheet][rowIndex] && auditReport[sheet][rowIndex][colId] ? auditReport[sheet][rowIndex][colId] : [],
            attached: false
        }
    }

    getValue(){
        return this.parseValue(this.state.value);
    }

    handleChange = (e) => {
        const { value } = e.target;

        this.setState({...this.state, value}, () => this.props.stopEditing());
    }

    afterGuiAttached = () => {
        this.inputRef.current.focus();
        setTimeout(() => {
            this.setState({...this.state, attached: true})
        }, 20);
    }

    handleClickAway = () => {
        if(this.state.attached){
            this.props.stopEditing();
        }
    }

    isPopup = () => true;

    render() {
        const { errors } = this.state;
        const { column, context } = this.props;       

        let dynamicOpts = context.selectOptions[column.colId].map( (e, i) => (
            <option
                key={i + 1} 
                value={e.toLowerCase()}
                className='ds-cell-editor-select-option'
                style={{
                    backgroundColor: '#184562',
                }}
            >
                {e}
            </option>
        ));

        let opts = [<option key={0} disabled style={{display: 'none'}} value=''></option>, ...dynamicOpts];

        return (
            <div
                style={{
                    margin: '0 auto',
                    width: 'auto',
                    padding: '12px',
                    height: 'auto',
                    maxWidth: '300px'
                }}
            >
                <ClickAwayListener onClickAway={this.handleClickAway}>
                    <div>
                        <select
                            ref={this.inputRef}
                            value={this.state.value}
                            onChange={this.handleChange}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'white',
                                // height: '28px',
                                border: `1px solid ${colors.primary}`,
                                borderRadius: '2px',
                                padding: '2px 6px',
                                // maxWidth: '100%'
                            }}
                        >
                            {opts}
                        </select>
                        {
                            errors.map((err, i) => {
                                return (
                                    <p 
                                        key={i}
                                        style={{
                                            lineHeight: 1.2,
                                            margin: '6px auto',
                                            textAlign: 'left',
                                            maxWidth: '100%',
                                            whiteSpace: 'pre-wrap'
                                        }}
                                    >
                                        {err}
                                    </p>
                                )
                            })
                        }

                        <p 
                            style={{
                                lineHeight: 1.2,
                                margin: '10px auto',
                                textAlign: 'left',
                                maxWidth: '100%',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            If you don't see the correct value on this list please contact us at: {'\n'}<a style={{color:colors.primary, textDecoration: 'none'}} href="mailto:cmap-data-submission@uw.edu">cmap-data-submission@uw.edu</a>.
                        </p>
                    </div>
                </ClickAwayListener>
            </div>
        )
    }
}

export default DSCellEditorSelect;