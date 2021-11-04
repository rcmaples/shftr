import {
  defaultFont,
  primaryColor,
  defaultBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  boxShadow,
  drawerWidth,
  transition,
  whiteColor,
  grayColor,
  blackColor,
  hexToRgb,
} from '../main';

const bugReportFormStyle = theme => ({
  bugReportForm: {
    padding: '15px',
  },
  root: {
    padding: '10px',
    '& > *': {
      // padding: theme.spacing(1),
      margin: theme.spacing(1),
      width: '95%',
    },
  },
});

export default bugReportFormStyle;
