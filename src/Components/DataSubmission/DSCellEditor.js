import React from 'react';

import checkCell from '../../Utility/DataSubmission/checkCell';
import { ClickAwayListener } from '@material-ui/core';

class DSCellEditor extends React.Component {
    constructor(props){
        const { auditReport, sheet } = props.context;
        const { rowIndex } = props;
        const { colId } = props.column;
        super(props);
        this.inputRef = React.createRef();
        this.parseValue = props.parseValue;
        this.state = {
            value: props.value || '',
            errors: auditReport[sheet][rowIndex] && auditReport[sheet][rowIndex][colId] ? auditReport[sheet][rowIndex][colId] : [],
            attached: false
        }
    }

    getValue(){
        return this.parseValue(this.state.value);
    }

    handleChange = (e) => {
        const { value } = e.target;

        let errors = checkCell(value, this.props.column.colId);
        this.setState({...this.state, value, errors});
    }

    afterGuiAttached = () => {
        this.inputRef.current.focus();
        this.inputRef.current.select();
        setTimeout(() => {
            this.setState({...this.state, attached: true})
        }, 20);
    }

    handleClickAway = () => {
        if(this.state.attached){
            this.props.stopEditing();
        }
    }

    render() {
        const { errors } = this.state;

        return (
            <div
                style={{
                    maxWidth: '175px',
                    margin: '0 auto'
                }}
            >
                <ClickAwayListener onClickAway={this.handleClickAway}>
                    <div>
                        <input
                            spellCheck='false'
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
                                maxWidth: '100%'
                            }}
                        />
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
                    </div>
                </ClickAwayListener>
            </div>
        )
    }
}

export default DSCellEditor;