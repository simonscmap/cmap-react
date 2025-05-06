import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    textAlign: 'left',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
    marginTop: 12,
  },
});

export default function ErrorCard(props) {
  let { title, message, details } = props;
  const classes = useStyles();

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography variant="h5" component="h2" color="textSecondary">
          {title || 'Error'}
        </Typography>
        <Typography className={classes.pos} variant="body1">
          {message || 'There was an error performing the current operation.'}
        </Typography>
        {details && (
          <React.Fragment>
            <Typography variant="h6" component="h3">
              Details
            </Typography>
            <Typography variant="pre" component="p">
              {details}
            </Typography>
          </React.Fragment>
        )}
      </CardContent>
    </Card>
  );
}
