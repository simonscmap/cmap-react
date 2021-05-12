import React from 'react';
import { Typography } from '@material-ui/core';

const SearchHelpContents = (props) => {

    return (
        <React.Fragment>
                <Typography>
                    Begin typing in the search field to see keyword suggestions:
                </Typography>

                <img 
                    src='/images/help_catalog_search_autocomplete.png' 
                    style={{
                        margin: '20px auto',
                        display: 'block',
                        width: '480px',
                        maxWidth: '80vw'
                    }}
                    alt='Keyword Autocomplete Example'
                />

                <Typography>
                    Use the keyboard or mouse to select a keyword from the list, or press enter to use the typed keyword as is.
                </Typography>

                <Typography style={{marginTop: '12px'}}>
                    Repeat the process to search for multiple keywords:
                </Typography>

                <img 
                    src='/images/help_catalog_search_mulitple.png' 
                    style={{
                        margin: '20px auto',
                        display: 'block',
                        width: '480px',
                        maxWidth: '80vw'
                    }}
                    alt='Multiple Keyword Example'
                />

                <Typography>
                    Press escape to clear the keyword field, or backspace to remove the most recently added keyword.
                </Typography>

                <Typography style={{marginTop: '12px'}}>
                    Commonly searched keywords include:
                </Typography>

                <Typography style={{marginTop: '12px'}}>
                    <strong>Nutrients</strong> such as nitrogen, phosphorus, or carbon.
                </Typography>

                <Typography style={{marginTop: '12px'}}>
                    <strong>Organisms</strong> such as prochlorococcus, or synechococcus.
                </Typography>

                <Typography style={{marginTop: '12px'}}>
                    <strong>Disciplines</strong> such as biogeochemistry or physics.
                </Typography>

                <Typography style={{marginTop: '12px'}}>
                    <strong>Sensors</strong> such as satellite, flow cytometer, or sediment trap.
                </Typography>

                <Typography style={{marginTop: '12px'}}>
                    <strong>Names</strong> such as Armbrust.
                </Typography>

                <Typography style={{marginTop: '12px'}}>
                    <strong>Institutions</strong> such as University of Washington.
                </Typography>  
        </React.Fragment>
    )
}

export default SearchHelpContents;