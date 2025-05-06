// spinner & wrapper
import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { colors } from '../Home/theme';
import z from '../../enums/zIndex';

const styles = (theme) => ({
  loaderContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItem: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    zIndex: z.LOADING_OVERLAY + 1,
    opacity: 1,
  },

  spinnerText: {
    zIndex: z.LOADING_OVERLAY + 2,
    color: theme.palette.primary.main,
    marginTop: '25px',
    opacity: 1,
  },

  spinner: {
    opacity: 1,
  },

  /* Shared amongst all three nodes */
  cmapSpinner: {
    color: 'white',
    animation:
      '$cmapSpinnerAnimate 2000ms infinite cubic-bezier(.56,.08,.54,.96)',
    // animationDuration: '2000ms',
    animationIterationCount: 'infinite',
    // animationTimingFunction: 'cubic-bezier(.56,.08,.54,.96)',
    transformOrigin: 'center center',
  },

  /* Inner node */
  cmapSpinnerInner: {
    animationDelay: '0ms',
  },

  /* Middle node */
  cmapSpinnerMiddle: {
    animationDelay: '250ms',
  },
  /* Outer node */
  cmapSpinnerOuter: {
    animationDelay: '500ms',
  },

  /* The keyframe animation */
  '@keyframes cmapSpinnerAnimate': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '70%, 100%': {
      transform: 'rotate(360deg)',
    },
  },

  /** overrides **/

  lime: {
    color: colors.green.lime,
  },

  /* potential variants */

  demoSize: {
    width: '50px',
    height: '50px',
  },

  demoContained: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',

    '& svg': {
      width: '75px',
      height: '75px',
    },
  },

  demoDark: {
    color: '#07274D',
  },
});

export const SpinnerSVG = () => {
  return (
    <svg style={{ display: 'none' }}>
      <symbol id="cmapSpinnerInner" viewBox="0 0 100 100">
        <g opacity="0.4">
          <path
            d="M64.9867 24.1884C63.5223 23.3341 61.9845 22.6019 60.3858 22.0039L58.6895 26.617C60.0197 27.1174 61.3011 27.7154 62.5093 28.4232L64.9745 24.2006L64.9867 24.1884Z"
            fill="currentColor"
          />
          <path
            d="M58.4698 21.3694C56.8345 20.93 55.1992 20.5639 53.515 20.3564L52.9536 25.2137C54.3571 25.3845 55.7117 25.6896 57.0664 26.0557L58.4698 21.3694Z"
            fill="currentColor"
          />
          <path
            d="M67.3664 67.9155C66.3535 68.9041 65.2551 69.8072 64.0835 70.6126L66.8172 74.6522C68.2329 73.688 69.5509 72.6019 70.7835 71.4059L67.3664 67.9033V67.9155Z"
            fill="currentColor"
          />
          <path
            d="M45.3139 25.5065C47.291 25.1282 49.3046 24.9085 51.3183 25.0916L51.599 20.1855C48.7188 20.0147 45.8265 20.3686 43.0195 20.9788L44.1789 25.7384C44.5572 25.6529 44.9356 25.5919 45.3139 25.5187V25.5065Z"
            fill="currentColor"
          />
          <path
            d="M64.9744 30.0464C65.7676 30.6444 66.5121 31.279 67.2321 31.9503L70.6248 28.4233C69.3922 27.2639 68.062 26.2144 66.6829 25.2258L63.9736 29.2776C64.3276 29.5095 64.6449 29.7779 64.9866 30.0342L64.9744 30.0464Z"
            fill="currentColor"
          />
          <path
            d="M28.1425 37.9424C29.2775 35.9409 30.6565 34.0737 32.2675 32.4384L28.8137 28.9968C26.8733 30.9617 25.2257 33.195 23.8711 35.5992L28.1547 37.9424H28.1425Z"
            fill="currentColor"
          />
          <path
            d="M29.8024 64.6084C28.643 63.0096 27.6667 61.2767 26.8978 59.4583L22.3701 61.2889C23.4807 63.9371 24.9818 66.4024 26.727 68.6723L30.5346 65.5969C30.2783 65.2796 30.0465 64.9379 29.8146 64.6084H29.8024Z"
            fill="currentColor"
          />
          <path
            d="M37.1857 71.4059C35.1355 70.1733 33.2805 68.6356 31.6451 66.8904L28.0205 70.1977C29.9976 72.2968 32.2431 74.1518 34.7205 75.6407L37.2224 71.4181L37.1857 71.3937V71.4059Z"
            fill="currentColor"
          />
          <path
            d="M25.3358 53.7589C24.8476 50.9153 24.9697 47.9742 25.5066 45.155L20.7105 44.1909C19.9538 48.0718 19.9538 52.1358 20.7471 56.0044L25.531 55.0037C25.4456 54.5888 25.409 54.1738 25.3358 53.7589Z"
            fill="currentColor"
          />
          <path
            d="M50.0003 74.9818C48.0232 74.9818 46.095 74.7255 44.1911 74.2739L43.0317 79.0335C46.9859 79.9854 51.2573 80.1197 55.248 79.3874L54.3693 74.5668C52.9414 74.8231 51.4892 74.9696 50.0003 74.9696V74.9818Z"
            fill="currentColor"
          />
          <path
            d="M41.1888 73.3464C40.3345 73.0169 39.4924 72.6386 38.6747 72.2358L36.4414 76.5927C37.9913 77.3493 39.5778 78.0084 41.2132 78.5453L42.6411 73.8712C42.1529 73.7247 41.6769 73.5173 41.201 73.3464H41.1888Z"
            fill="currentColor"
          />
          <path
            d="M62.6556 71.5037C60.5687 72.6753 58.3476 73.6272 56.0288 74.2252L57.2004 78.997C60.0073 78.2891 62.68 77.1297 65.2062 75.7141L62.7044 71.5037H62.68H62.6556Z"
            fill="currentColor"
          />
          <path
            d="M34.6962 30.3272C37.0272 28.4722 39.6633 27.0687 42.5435 26.1534L41.1034 21.4915C37.1737 22.7241 33.6223 24.7377 30.5347 27.3738L33.7321 31.0716C34.0372 30.8031 34.3789 30.5713 34.6962 30.3272Z"
            fill="currentColor"
          />
        </g>
      </symbol>
      <symbol id="cmapSpinnerMiddle" viewBox="0 0 100 100">
        <g opacity="0.7">
          <path
            d="M66.3781 22.1993C67.4277 22.8095 68.4284 23.4807 69.4047 24.2007L73.4565 18.8554C70.4055 16.6098 67.1104 14.7426 63.5468 13.4124L61.228 19.7096C63.0342 20.3809 64.7428 21.2229 66.3781 22.1993Z"
            fill="currentColor"
          />
          <path
            d="M72.5165 73.1389C71.1741 74.4325 69.734 75.6285 68.1841 76.6903L71.9429 82.2431C73.8224 80.9617 75.5797 79.5094 77.2029 77.9351L72.5165 73.1389Z"
            fill="currentColor"
          />
          <path
            d="M21.711 34.4277C23.1755 31.8282 24.9817 29.3996 27.0685 27.2761C27.0685 27.2761 27.154 27.1907 27.2028 27.1419C28.1425 26.2021 29.1554 25.3235 30.205 24.4936L26.1166 19.1848C21.9306 22.4433 18.4159 26.5561 15.8286 31.1936C17.0734 31.877 20.515 33.7565 21.711 34.4155V34.4277Z"
            fill="currentColor"
          />
          <path
            d="M40.3955 19.1603L38.4184 12.741C34.7572 13.8881 31.3279 15.5479 28.2158 17.6592L31.9869 23.2242C34.5619 21.4913 37.3811 20.1 40.4077 19.1603H40.3955Z"
            fill="currentColor"
          />
          <path
            d="M17.696 49.9999C17.696 49.0602 17.7448 48.1449 17.818 47.2296L11.1424 46.6316C10.9349 48.8405 10.9349 51.1471 11.1424 53.356L17.8302 52.758C17.757 51.8427 17.7082 50.9274 17.7082 49.9999H17.696Z"
            fill="currentColor"
          />
          <path
            d="M23.8345 68.8918C23.0656 67.83 22.3578 66.7317 21.7232 65.5967L15.8408 68.8186C17.7202 72.1259 20.039 75.2135 22.7483 77.8862L27.4225 73.0778C26.1044 71.7963 24.9206 70.3807 23.8345 68.8918Z"
            fill="currentColor"
          />
          <path
            d="M20.1858 62.3871C19.1851 59.9585 18.4651 57.4688 18.0501 54.845L11.4111 55.8335C11.9847 59.6168 13.1441 63.1925 14.7184 66.6463L20.7838 63.7661C20.5642 63.3146 20.3811 62.8508 20.1858 62.3871Z"
            fill="currentColor"
          />
          <path
            d="M35.2942 78.7282C33.0243 77.5566 30.8642 76.1165 28.9359 74.4568L24.5425 79.5215C27.4348 82.0111 30.7177 84.0614 34.1837 85.6479L36.893 79.5093C36.3438 79.2652 35.819 78.9967 35.2942 78.7282Z"
            fill="currentColor"
          />
          <path
            d="M18.3186 43.7149L18.3552 43.5318C18.5627 42.6043 18.7823 41.689 19.0508 40.7859L12.6315 38.8577C12.0091 40.969 11.5453 43.1291 11.2769 45.3258L17.9525 46.1191C18.0501 45.3136 18.1721 44.5081 18.3308 43.7149H18.3186Z"
            fill="currentColor"
          />
          <path
            d="M64.8649 78.6307C63.7299 79.2287 62.5461 79.7412 61.3501 80.2294L63.6933 86.5145C65.8046 85.6724 67.8549 84.6961 69.8197 83.5855L66.3904 77.813C65.89 78.1059 65.3652 78.3622 64.8527 78.6307H64.8649Z"
            fill="currentColor"
          />
          <path
            d="M57.7133 81.34C54.0033 82.2553 50.037 82.5482 46.2171 82.0722L45.4116 88.7357C50.7448 89.4069 56.2366 88.8211 61.3501 87.3078L59.3853 80.8884C58.8361 81.0593 58.2747 81.1935 57.7133 81.3278V81.34Z"
            fill="currentColor"
          />
          <path
            d="M36.4536 86.5878C38.5893 87.3811 40.8105 87.9791 43.1048 88.394L44.2764 81.7916C42.3848 81.4499 40.5542 80.9618 38.7968 80.3027L36.4536 86.5878Z"
            fill="currentColor"
          />
          <path
            d="M51.794 17.7691C54.3325 17.9033 56.7489 18.3427 59.1531 19.0261L61.0813 12.5946C57.5299 11.5572 53.8321 11.0325 50.0854 10.9836V17.6959C50.659 17.6959 51.2204 17.7447 51.794 17.7569V17.7691Z"
            fill="currentColor"
          />
          <path
            d="M43.9592 18.2939C45.265 18.0376 46.5831 17.8789 47.9133 17.7569L47.4984 11.0569C45.2528 11.2155 43.0317 11.545 40.8472 12.0698L42.4337 18.5868C42.9341 18.4647 43.4466 18.3793 43.9592 18.2939Z"
            fill="currentColor"
          />
        </g>
      </symbol>
      <symbol id="cmapSpinnerOuter" viewBox="0 0 100 100">
        <g>
          <path
            d="M14.9011 27.9962L7.66407 23.4319C6.12636 25.8727 4.79612 28.4722 3.68555 31.1815L11.6182 34.3789C12.5335 32.1456 13.6319 30.0099 14.9011 27.9962Z"
            fill="currentColor"
          />
          <path
            d="M24.6154 17.2566L19.3921 10.4834C15.5478 13.4734 12.1551 17.0126 9.31152 20.9789L16.2922 25.9337C18.6354 22.663 21.4424 19.7341 24.6276 17.2566H24.6154Z"
            fill="currentColor"
          />
          <path
            d="M0 50C0 51.4523 0.0732243 52.8923 0.195265 54.3202L8.70149 53.5635C8.60386 52.392 8.54284 51.196 8.54284 50C8.54284 47.1198 8.84794 44.3251 9.40932 41.6158L1.04955 39.8706C0.378326 43.1413 0 46.5218 0 50H0Z"
            fill="currentColor"
          />
          <path
            d="M78.6427 20.0636L84.5739 13.8883C82.487 11.8869 80.217 10.0562 77.8006 8.43311L73.0532 15.5603C75.0425 16.9027 76.9097 18.416 78.6305 20.0636H78.6427Z"
            fill="currentColor"
          />
          <path
            d="M59.8853 90.2611L61.8989 98.5721C64.7669 97.8643 67.5494 96.9246 70.1977 95.7408L66.7317 87.918C64.535 88.8943 62.2528 89.6754 59.8853 90.2611Z"
            fill="currentColor"
          />
          <path
            d="M50 91.4571C48.3525 91.4571 46.7171 91.3473 45.1184 91.1642L44.0933 99.646C46.0337 99.8779 47.9986 100 50 100C53.0266 100 55.9922 99.7193 58.8724 99.1945L57.3469 90.7859C54.9671 91.213 52.5141 91.4449 50.0122 91.4449L50 91.4571Z"
            fill="currentColor"
          />
          <path
            d="M22.0283 8.5428L26.8245 15.6334C31.401 12.5335 36.6366 10.3612 42.2626 9.28725L40.6761 0.866455C33.8663 2.14788 27.5446 4.80836 22.0161 8.5428H22.0283Z"
            fill="currentColor"
          />
          <path
            d="M70.8566 14.1934L75.1769 6.80995C70.9909 4.36914 66.4266 2.51412 61.5816 1.36694L59.6167 9.69011C63.6196 10.642 67.3907 12.1797 70.8566 14.2056V14.1934Z"
            fill="currentColor"
          />
          <path
            d="M69.0747 86.7951L72.9922 94.3983C77.3735 92.1283 81.3642 89.2237 84.8668 85.8188L78.8868 79.6924C75.9944 82.5115 72.6871 84.9035 69.0747 86.7951Z"
            fill="currentColor"
          />
          <path
            d="M50 8.54284C50.7078 8.54284 51.4034 8.56724 52.0991 8.59165L52.5506 0.0610203C51.7085 0.0244081 50.8543 0 50 0C47.9253 0 45.8872 0.134245 43.8857 0.378326L44.9475 8.88455C46.6072 8.67708 48.2792 8.55504 50 8.55504V8.54284Z"
            fill="currentColor"
          />
          <path
            d="M41.1763 99.2067L42.6652 90.7981C38.5646 90.0659 34.6837 88.7112 31.0957 86.8562L27.166 94.4715C31.4985 96.7049 36.2092 98.3158 41.1641 99.2067H41.1763Z"
            fill="currentColor"
          />
          <path
            d="M11.7158 65.8896L3.80762 69.1603C4.88157 71.7598 6.1752 74.2372 7.65189 76.5926L14.9011 72.0161C13.6807 70.0756 12.6067 68.0376 11.7158 65.8896Z"
            fill="currentColor"
          />
          <path
            d="M9.00672 56.1997L0.549316 57.4567C0.976458 60.3491 1.67209 63.156 2.57519 65.8653L10.6909 63.1316C9.94643 60.8983 9.36064 58.5795 9.00672 56.1997Z"
            fill="currentColor"
          />
          <path
            d="M16.4021 74.2373L9.4458 79.2288C13.4365 84.7572 18.5378 89.4314 24.4202 92.9461L28.8014 85.5627C23.9442 82.6581 19.7094 78.8016 16.4021 74.2373Z"
            fill="currentColor"
          />
        </g>
      </symbol>
    </svg>
  );
};

export const Spinner = withStyles(styles)(({
  classes,
  message,
  variant = {},
}) => {
  let { spinnerColor = 'lime' } = variant;
  return (
    <div>
      <SpinnerSVG />
      <div className={classes.loaderContent}>
        <div>
          <svg className={classes[spinnerColor]} height="100px" width="100px">
            <use
              xlinkHref="#cmapSpinnerInner"
              className={clsx(
                classes.cmapSpinner,
                classes.cmapSpinnerInner,
                classes[spinnerColor],
              )}
            />
            <use
              xlinkHref="#cmapSpinnerMiddle"
              className={clsx(
                classes.cmapSpinner,
                classes.cmapSpinnerMiddle,
                classes[spinnerColor],
              )}
            />
            <use
              xlinkHref="#cmapSpinnerOuter"
              className={clsx(
                classes.cmapSpinner,
                classes.cmapSpinnerOuter,
                classes[spinnerColor],
              )}
            />
          </svg>
        </div>
        <Typography variant="h6" className={classes.spinnerText}>
          {message}
        </Typography>
      </div>
    </div>
  );
});

export default Spinner;

const useWrapperStyles = makeStyles((theme) => ({
  spinnerWrapper: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  overlayWrapper: {
    backgroundColor: '#000000',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    zIndex: z.LOADING_OVERLAY,
  },
}));

export const ErrorWrapper = (props) => {
  const { message } = props;
  const cl = useWrapperStyles();
  return (
    <div className={cl.spinnerWrapper}>
      <p>{message}</p>
    </div>
  );
};

export const SpinnerWrapper = (props) => {
  const { message } = props;
  const cl = useWrapperStyles();
  return (
    <div className={cl.spinnerWrapper}>
      <Spinner message={message} />
    </div>
  );
};

export const OverlaySpinner = (props) => {
  const { message } = props;
  const cl = useWrapperStyles();
  return (
    <div className={cl.overlayWrapper}>
      <Spinner message={message} />
    </div>
  );
};

/*          <div>
            <h3>Default</h3>
            <svg height="100px" width="100px">
              <use
                xlinkHref="#cmapSpinnerInner"
                className={clsx(classes.cmapSpinner, classes.cmapSpinnerInner)}
              />
              <use
                xlinkHref="#cmapSpinnerMiddle"
                className={clsx(classes.cmapSpinner, classes.cmapSpinnerMiddle)}
              />
              <use
                xlinkHref="#cmapSpinnerOuter"
                className={clsx(classes.cmapSpinner, classes.cmapSpinnerOuter)}
              />
            </svg>
          </div> */
/*
          <div>
            <h3>Size</h3>
            <svg className={classes.demoColor}>
              <use
                xlinkHref="#cmapSpinnerInner"
                className={clsx(classes.cmapSpinner, classes.cmapSpinnerInner)}
              />
              <use
                xlinkHref="#cmapSpinnerMiddle"
                className={clsx(classes.cmapSpinner, classes.cmapSpinnerMiddle)}
              />
              <use
                xlinkHref="#cmapSpinnerOuter"
                className={clsx(classes.cmapSpinner, classes.cmapSpinnerOuter)}
              />
            </svg>
        </div>

        */

/*
          <div>
            <h3>Combo</h3>
            <div className={classes.demoContained}>
              <svg width="100" height="100">
                <use
                  xlinkHref="#cmapSpinnerInner"
                  className={cmap-spinner cmap-spinner--inner demo-dark}
                />
                <use
                  xlinkHref="#cmapSpinnerMiddle"
                  className={cmap-spinner cmap-spinner--middle demo-dark}
                />
                <use
                  xlinkHref="#cmapSpinnerOuter"
                  className={cmap-spinner cmap-spinner--outer demo-dark}
                />
              </svg>
            </div>
          </div>*/
