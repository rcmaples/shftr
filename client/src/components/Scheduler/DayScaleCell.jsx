import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import schedulerStyles from '../../styles/jss/views/scheduler';

import { WeekView } from '@devexpress/dx-react-scheduler-material-ui';

const DayScaleCell = ({ classes, ...restProps }) => {
  const { startDate } = restProps;
  if (startDate.getDay() === 0 || startDate.getDay() === 6) {
    return <WeekView.DayScaleCell {...restProps} className={classes.weekEnd} />;
  }
  return <WeekView.DayScaleCell {...restProps} />;
};

export default withStyles(schedulerStyles, { name: 'DayScaleCell' })(
  DayScaleCell
);
