import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import schedulerStyles from '../../styles/jss/views/scheduler';

import { WeekView } from '@devexpress/dx-react-scheduler-material-ui';

const isRestTime = date =>
  date.getDay() === 0 ||
  date.getDay() === 6 ||
  date.getHours() < 8 ||
  date.getHours() >= 20;

const TimeTableCell = ({ classes, ...restProps }) => {
  const { startDate } = restProps;
  if (isRestTime(startDate)) {
    return (
      <WeekView.TimeTableCell {...restProps} className={classes.weekendCell} />
    );
  }
  return <WeekView.TimeTableCell {...restProps} />;
};

export default withStyles(schedulerStyles, { name: 'TimeTableCell' })(
  TimeTableCell
);
