import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import Page from '../Common/Page';
import Section, { FullWidthContainer } from '../Common/Section';
import { Link } from 'react-router-dom';
import { colors } from '../Home/theme';

const styles = () => ({
  sectionGap: {
    marginBottom: '1.5em',
  },
  paragraphGap: {
    marginTop: '1em',
  },
  tallLines: {
    lineHeight: '1.9em',
  },
  cardList: {
    display: 'flex',
    flexFlow: 'row wrap',
    gap: '5%',
    '& > div': {
      maxWidth: '35%',
      minWidth: '30%',
      flexBasis: 'min-content',
      marginBottom: '2em',
    },
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '10px',
    padding: '9px',
    borderRadius: '6px',
    textAlign: 'left',
    // background: colors.blue.royal,
    background: colors.gradient.newsBlock,
    '& > div': {
      borderRadius: '6px',
      background: 'rgba(255, 255, 255, 0.14)',
      transition: 'background 0.5s ease-out',
      padding: '10px',
      height: 'calc(100% - 20px)',
      width: 'calc(100% - 20px)',
      '& a': {
        color: 'white',
        '&:hover': {
          color: 'white',
          textDecoration: 'underline',
        }
      },
      // h4 no longer in use
      '& h4': {
        lineHeight: '1.75rem',
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-line-clamp': 5,
        '-webkit-box-orient': 'vertical',
        '& a': {
          color: 'white',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
      '& p': {
        lineHeight: '1.5rem',
      },
    },
  },

  contentVerticalFlex: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },


  galleryThumb: {
    width: '100%',
    '& > img': {
      margin: '1em 0',
      width: '100%',
      height: '100%',
    }
  }
});

const HeroContent = withStyles(styles)(() => (
  <div>
    <Typography variant="subtitle1" style={{ fontSize: '1.6rem' }}>
      Browse the gallery of Simons CMAP use cases to learn about how Simons CMAP
      can be used to advance ocean science.
    </Typography>
    <Typography variant="body1">
      The Simons CMAP gallery features use cases highlighting how the community is using Simons CMAP to advance ocean science.
      Please consider submitting use cases from your own work for inclusion in the gallery.
    </Typography>
    <Typography variant="body1">
      Contact us at <a href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</a> to get started.
    </Typography>
  </div>
));

const Card = withStyles(styles)(({ classes, children }) => (
  <div className={classes.card}>
    <div className={classes.cardInnerContainer}>{children}</div>
  </div>
));

const About = ({ classes }) => {
  return (
    <Page pageTitle={'Gallery'} heroContent={<HeroContent />}>
      <FullWidthContainer bgVariant={'slate'}>

        <Section name={'gettingStarted'} title={'Getting Started'}>
          <div className={classes.cardList}>
            <Card>
              <div className={classes.contentVerticalFlex}>
                <div>
                  <Typography variant="body1">
                    <Link to="/gallery/getting-started-cruise-plan">
                      Cruise Planning: Contemporaneous Sampling Along An Arbitrary Cruise Trajectory
                    </Link>
                  </Typography>

                  <a href="https://doi.org/10.5281/zenodo.7839055">
                    <img
                      src="https://zenodo.org/badge/DOI/10.5281/zenodo.7839055.svg"
                      alt="DOI"
                    />
                  </a>

                  <div className={classes.galleryThumb}>
                    <img src="/images/gallery/getting-started-cruise-plan.jpg" alt="Cruise plan graph" />
                  </div>
    </div>

                <div className={classes.contributors}>

                  <Typography variant="body2">
                    Contributors: Mohammad Ashkezari, Ginger Armbrust
                  </Typography>
                </div>
              </div>
            </Card>

            <Card>
              <Typography variant="body1">
                <Link to="/gallery/getting-started-cruise-map">
                  GeoSpatial Map Superimposed by Arbitrary Cruise Trajectories
                </Link>
              </Typography>

              <a href="https://doi.org/10.5281/zenodo.7839055">
                <img
                  src="https://zenodo.org/badge/DOI/10.5281/zenodo.7839055.svg"
                  alt="DOI"
                />
              </a>


              <div className={classes.galleryThumb}>
                <img src="/images/gallery/getting-started-cruise-map.png" alt="Geospacial cruise map" />
              </div>

              <div className={classes.contributors}>
                <Typography variant="body2">
                  Contributors: Mohammad Ashkezari, Ginger Armbrust
                </Typography>
              </div>

            </Card>
          </div>
        </Section>


        <Section name={'studies'} title={'Research'}>
          <div className={classes.cardList}>
            <Card>
              <Typography variant="body1">
                <Link to="/gallery/seaflow-time-series-decomposition">
                  Using Simons CMAP to decompose SeaFlow time series data and
                  estimate diel variation over cruises
                </Link>
              </Typography>

              <a href="https://doi.org/10.5281/zenodo.7320268">
                <img
                  src="https://zenodo.org/badge/DOI/10.5281/zenodo.7320268.svg"
                  alt="DOI"
                />
              </a>


              <div className={classes.galleryThumb}>
                <img src="/images/gallery/seaflow-time-series-decomposition.png" alt="Seaflow time series graphs" />
              </div>

              <Typography variant="body2">
                Contributors: Katherine Qi
              </Typography>
            </Card>
          </div>
        </Section>

        <Section name={'support'} title={'Instructional Resources'}>
          <div className={classes.cardList}>
            <Card>
              <Typography variant="body1">
                <Link
                  to="/gallery/compare-sst-data"
                  className={classes.linkWhite}
                >
                  Using Simons CMAP to compare sea surface temperature data
                  collected by different instruments
                </Link>
              </Typography>
              <Typography variant="body2">
                Contributors: Sasha Seroy, Tansy Clay Burns
              </Typography>
            </Card>
          </div>
        </Section>
      </FullWidthContainer>
    </Page>
  );
};

export default withStyles(styles)(About);

export const galleryConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
