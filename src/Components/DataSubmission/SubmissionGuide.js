import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Typography, ListItem, List, ListItemText, Grid, Paper, Divider, Link } from '@material-ui/core';

import colors from '../../Enums/colors';

const styles = (theme) => ({
    stickyPaper: {
        position: '-webkit-sticky',
        position: 'sticky',
        top: '90px',
        width: '180px',
        marginLeft: '20px',
        paddingLeft: '12px',
        backgroundColor: 'rgba(0,0,0,.4)'
    },

    guideSection: {
        width: '90%',
        height: '2000px',
        margin: '20px auto 0 auto',
        textAlign: 'left',
        padding: '12px 32px',
        fontFamily: '"roboto", Serif',
        maxWidth: '700px',
        backgroundColor: 'rgba(0,0,0,.4)'
    },

    sectionHeader: {
        margin: '8px 0',
        fontWeight: 100,
        fontFamily: '"roboto", Serif', 
    },

    '@media screen and (max-width: 1250px)': {
        stickyPaper: {
          display: 'none',
        },
    },

    navListItem: {
        color: theme.palette.primary.main,
        padding: '2px 10px 2px 6px'
    },

    navListItemText: {
        fontSize: '16px',
        '&:hover': {
            textDecoration: 'underline'
        }
    },

    navListItemtextWrapper: {
        margin: '2px 0'
    },

    subListText: {
        margin: 0,
        '&:hover': {
            textDecoration: 'underline'
        }
    },

    anchor: {
        display: 'block',
        position: 'relative',
        top: '-120px',
        visibility: 'hidden'
    },

    divider: {
        backgroundColor: theme.palette.primary.main,
        marginBottom: '8px'
    },
})

const SubmissionGuide = (props) => {
    const { classes } = props;

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={2}>
                    <Paper className={classes.stickyPaper} elevation={6}>
                        <List dense={true}>
                            <ListItem component='a' href='#getting-started' className={classes.navListItem}>
                                <ListItemText
                                    primary="Getting Started"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <ListItem component='a' href='#submission-process' className={classes.navListItem}>
                                <ListItemText
                                    primary="Submission Process"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <List dense={true} style={{padding: '0 0 0 15px'}}>
                                <ListItem component='a' href='#validation' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Validation"
                                        className={classes.subListText}
                                    />
                                </ListItem>

                                <ListItem component='a' href='#feedback' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Feedback"
                                        className={classes.subListText}
                                    />
                                </ListItem>

                                <ListItem component='a' href='#doi' className={classes.navListItem}>
                                    <ListItemText
                                        primary="DOI"
                                        className={classes.subListText}
                                    />
                                </ListItem>

                                <ListItem component='a' href='#ingestion' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Ingestion"
                                        className={classes.subListText}
                                    />
                                </ListItem>
                            </List>

                            <ListItem component='a' href='#dashboard' className={classes.navListItem}>
                                <ListItemText
                                    primary="User Dashboard"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <ListItem component='a' href='#contact' className={classes.navListItem}>
                                <ListItemText
                                    primary="Contact"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <ListItem component='a' href='#resources' className={classes.navListItem}>
                                <ListItemText
                                    primary="Resources"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={8}>
                    <Paper className={classes.guideSection} elevation={4}>
                        <Typography variant='h3' className={classes.sectionHeader}>
                            <a className={classes.anchor} id='getting-started'></a>
                            Getting Started
                        </Typography>

                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            Data submitted to <span style={{fontWeight: 600}}>Simons Collaborative Marine Atlas Project</span> must be precisely formatted to maintain
                            high levels of <em>discoverability</em>, <em>comparability</em>, and <em>database performance</em>. 
                        </Typography>
                        
                        <Typography style={{marginTop: '16px'}}>
                            The purpose of the data submission toolset is to provide automatic, immediate feedback to assist you in formatting your 
                            submission, facilitate communication with the data curation team, and allow you to track the progress of your submission.
                        </Typography>

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='submission-process'></a>
                            The Submission Process
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            Begin the process by downloading and populating a&nbsp;
                            <Link href='https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx' download='datasetTemplate.xlsx'>
                                blank xlsx template.
                            </Link>
                            &nbsp;Details on the requirements and structure can be found&nbsp;
                            <Link target='_blank' href='https://cmap.readthedocs.io/en/latest/faq_and_contributing/file_structure.html#'>here</Link>.
                        </Typography>

                        <Typography style={{marginTop: '16px'}}>
                            Please note that xlsx workbooks over 150MB <em>cannot be processed</em> using the web submission tools. If you would like to submit
                            a dataset that exceeds this limit please contact the data curation team at <a style={{color:colors.primary, textDecoration: 'none'}} href="mailto:cmap-data-submission@uw.edu">cmap-data-submission@uw.edu</a>.
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Validation
                            <a className={classes.anchor} id='validation'></a>
                        </Typography>

                        <Typography>
                            Load your workbook into the&nbsp;
                            <Link target='_blank' href='/datasubmission/validationtool'>submission tool</Link>
                            &nbsp;to begin validation. The tool will walk you through a step-by-step
                            process to identify and resolve any potential data or format issues.
                            Once the workbook has been validated it will be uploaded to a staging 
                            area to be reviewed by our data curation team. From this point you'll be able to track
                            the progress of your submission in the&nbsp;
                            <Link href='#dashboard'>user dashboard</Link>.
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Feedback
                            <a className={classes.anchor} id='feedback'></a>
                        </Typography>

                        <Typography>
                            The data curation team may have suggestions for additional changes to the workbook.
                            Any feedback will be sent to you via email notification, and visible in the&nbsp;
                            <Link href='#dashboard'>user dashboard</Link>.
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            DOI
                            <a className={classes.anchor} id='doi'></a>
                        </Typography>

                        <Typography>
                            Once your submission has been approved the data curation team will request a DOI
                            for the data. Information on obtaining DOIs can be found&nbsp;
                            <Link target='_blank' href='https://cmap.readthedocs.io/en/latest/faq_and_contributing/FAQ.html?highlight=doi#what-is-a-doi-and-how-do-i-get-one-for-my-dataset' download='datasetTemplate.xlsx'>
                                here
                            </Link>.
                            The DOI can be submitted through the <Link href='#dashboard'>user dashboard</Link>.
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Ingestion
                            <a className={classes.anchor} id='ingestion'></a>
                        </Typography>

                        <Typography>
                            Once a DOI has been submitted your data will be ingested into the CMAP database. After ingestion,
                            you'll be able to view your dataset in the <Link href='/catalog' target="_blank">data catalog</Link>, and
                            access it through the CMAP API using any of the CMAP&nbsp;
                            <Link href='https://cmap.readthedocs.io/en/latest/user_guide/API_ref/api_ref.html' target="_blank">software packages</Link>.
                        </Typography>

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='dashboard'></a>
                            User Dashboard
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            In the&nbsp;
                            <Link href='/datasubmission/userdashboard' target="_blank">user dashboard</Link>&nbsp;
                            you can track the ingestion process for any dataset that you've submitted,
                            send messages to the data curation team, and download the most recently submitted version of the workbook.
                            Additionally, in the event that the curation team requests additional changes to your submission you can 
                            load the most recent version directly into the validation tool, make any necessary changes, and resubmit.
                        </Typography>

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='contact'></a>
                            Contact
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            You can reach the CMAP data curation team at <a style={{color:colors.primary, textDecoration: 'none'}} href="mailto:cmap-data-submission@uw.edu">cmap-data-submission@uw.edu</a>.
                        </Typography>

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='resources'></a>
                            Resources
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            <Link target='_blank' href='https://cmap.readthedocs.io/en/latest/faq_and_contributing/datasubmission.html#dataset-examples'>Sample Data Submissions</Link>
                        </Typography>

                        <Typography>
                            <Link target='_blank' href='https://cmap.readthedocs.io/en/latest/faq_and_contributing/datasubmission.html#dataset-requirements'>Dataset Structure and Requirements</Link>
                        </Typography>

                        <Typography>
                            <Link href='https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx' download='datasetTemplate.xlsx'>
                                Download a Blank xlsx Template
                            </Link>
                        </Typography>

                        <Typography>
                            <Link href='https://cmap.readthedocs.io/en/latest/faq_and_contributing/FAQ.html?highlight=doi#what-is-a-doi-and-how-do-i-get-one-for-my-dataset' download='datasetTemplate.xlsx'>
                                What is a DOI and how do I get one for my dataset?
                            </Link>
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default withStyles(styles)(SubmissionGuide);