import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { createSelector } from 'reselect';
import dayjs from 'dayjs';
import { makeStyles } from '@material-ui/core';
import SectionHeader from './SectionHeader';
import renderBody from '../../Home/News/renderBody';
import renderHeadline from '../../Home/News/renderHeadline';

// TODO: remove news from dataset payload on api;
// TODO: add tags to news payload
// TODO: use selector to provide relevant news items in this section

// const getDatasetNewsSelector = createSelector (
//   [ (state) => state.news.stories ],
//   () => {

//   }

// );

const useStyles = makeStyles ((theme) => ({
  container: {
    position: 'relative',
    flex: 1,
    // and flex its contents to fill vertical space
    display: 'flex',
    flexDirection: 'column',
  },
  newsContainer: {
    position: 'relative',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    flex: 1, // fill vertical
  },
  newsScrollContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  story: {
    background: 'rgba(0,0,0,0.2)',
    padding: '1em',
    borderRadius: '5px',
    marginRight: '10px',
    '& > span': {
      fontSize: '1rem',
    },
    '& > h2': {
      marginTop: '2px',
      fontSize: '1.3rem',
      fontWeight: 400,
      fontFamily: 'Montserrat,sans-serif',
      '& a': {
        color: '#69FFF2',
        fontSize: '1.2rem',
        textTransform: 'uppercase',
      }
    },
    '& p.body': {
      fontSize: '0.95rem',
      '& a': {
        color: '#fff',
        textDecoration: 'underline',
        '&:hover': {
          color: '#69FFF2'
        }
      }
    }
  }
}));




const NewsSection = (props) => {
  const { news } = props;
  const cl = useStyles();

  if (!Array.isArray (news) || news.length === 0) {
    return <React.Fragment />
  }

  return (
    <div className={cl.container}>
      <SectionHeader title={'Related Announcements'} />
      <div className={cl.newsContainer}>
        <div className={cl.newsScrollContainer}>
          {news
           .map ((n) => ({...n, body: JSON.parse(n.body)}))
           .map ((n) => (<div className={cl.story}>
                           <span>{`${dayjs(n.publish_date).format('MMM D YYYY')}`}</span>
                           {renderHeadline(n.headline, n.link)}
                           <p className="body">{renderBody(n.body)}</p>
                         </div>))}
        </div>
      </div>
    </div>)
}

export default NewsSection;
