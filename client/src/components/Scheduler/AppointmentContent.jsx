import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import schedulerStyles from '../../styles/jss/views/scheduler';

import { Appointments } from '@devexpress/dx-react-scheduler-material-ui';

const AppointmentContent = ({ classes, data, formatDate, ...restProps }) => (
  <Appointments.AppointmentContent
    {...restProps}
    formatDate={formatDate}
    data={data}
  >
    <div className={classes.container}>
      <div className={classes.title}>{data.title}</div>
      <div className={classes.text}>{data.location}</div>
      <div className={classes.textContainer}>
        <div className={classes.time}>
          {formatDate(data.startDate, { hour: 'numeric', minute: 'numeric' })}
        </div>
        <div className={classes.time}>{' - '}</div>
        <div className={classes.time}>
          {formatDate(data.endDate, { hour: 'numeric', minute: 'numeric' })}
        </div>
      </div>
    </div>
  </Appointments.AppointmentContent>
);

export default withStyles(schedulerStyles)(AppointmentContent);
