import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';

const useNewsStyles = makeStyles({
  item: {
    margin: '1em 0'
  },
  headline: {
    fontWeight: 'bold',
    fontSize: '1.2em',
  }
});

const NewsItems = (props) => {
  const { selected, newsList } = props;
  const cl = useNewsStyles ();
  return (
    <div>
      <Typography variant="h6">Past Updates</Typography>
      <div>
        {Array.isArray(newsList) && newsList
         .filter((item) => {
           if (selected) {
             return item.datasets.includes(selected)
           }
           return true;
         })
         .map((item, ix) => (
           <div className={cl.item} key={ix}>
             <Typography className={cl.headline}>{item.headline}</Typography>
             <Typography>Date: {item.date}</Typography>
             <Typography>Link: {item.link}</Typography>
           </div>
         ))}
      </div>
    </div>
  );
}

export default NewsItems;
