import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import {
  TextField,
  Button,
  Paper,
  InputLabel,
  Select,
  MenuItem,
  ClickAwayListener,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import styles from '../../styles/jss/components/bugReportFormStyle';
const useStyles = makeStyles(styles);

import * as FullStory from '@fullstory/browser';

const ZAPHOOK = 'https://hooks.zapier.com/hooks/catch/3590552/bh0ehxy';

const priorityLabels = [
  { value: 'low-priority', name: 'Low Impact/Annoyance', key: 'low-priority' },
  {
    value: 'medium-priority',
    name: 'Medium Impact, Causes functional issues',
    key: 'medium-priority',
  },
  {
    value: 'high-priority',
    name: 'High Impact, Something is actively broken',
    key: 'high-priority',
  },
];

export const BugReportForm = ({ TransitionProps, placement, onClickAway }) => {
  const classes = useStyles();

  const [selectOpen, setSelectOpen] = useState(false);
  const [sessionUrl, setSessionUrl] = useState('');

  useEffect(() => {
    const url = FullStory.getCurrentSessionURL(true);
    setSessionUrl(url);
  }, []);

  const createIssue = async (
    { title, priority, description },
    { resetForm }
  ) => {
    let zapBody = {
      title: title,
      priority: priority,
      body: description + '\n\n---\nSession URL: ' + sessionUrl,
    };

    const options = {
      method: 'POST',
      body: JSON.stringify(zapBody),
    };
    fetch(ZAPHOOK, options)
      .then(response => {
        if (response.status >= 400) {
          throw response;
        }
        return response.json();
      })
      .then(({ request_id, status }) => {
        if (status !== 'success') {
          throw { zapierRequestId: request_id, status };
        }
        console.log(
          'Zapier Webhook response—\n' +
            '\tRequest id: ' +
            request_id +
            '\n' +
            '\tStatus: ' +
            status
        );
        resetForm({});
        onClickAway();
      })
      .catch(error => {
        resetForm({});
        onClickAway();
        throw error;
      });
  };

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (!selectOpen) {
          onClickAway();
        }
        return;
      }}
    >
      <Paper elevation={3}>
        <Formik
          initialValues={{
            title: '',
            priority: '',
            description: '',
          }}
          onSubmit={createIssue}
        >
          {({ handleChange, setFieldValue, values }) => (
            <Form className={classes.root}>
              <TextField
                variant='outlined'
                id='title'
                name='title'
                label='Title'
                fullWidth
                placeholder='Describe the issue in a few words...'
                value={values.title}
                onChange={handleChange}
              />
              <TextField
                variant='outlined'
                id='description'
                name='description'
                label='Description'
                fullWidth
                multiline
                placeholder='Provide more details about what happened and what you expected to happen.'
                value={values.description}
                onChange={handleChange}
              />
              <Select
                variant='outlined'
                id='priority'
                name='priority'
                label='Priority'
                fullWidth
                value={values.priority}
                onOpen={() => setSelectOpen(true)}
                open={selectOpen}
                onChange={({ target }) => {
                  setFieldValue(target.name, target.value);
                  setSelectOpen(false);
                }}
                MenuProps={{
                  TransitionProps: {
                    onExited: () => setSelectOpen(false),
                  },
                }}
              >
                {priorityLabels.map(label => {
                  return (
                    <MenuItem
                      name={label.name}
                      value={label.value}
                      key={label.key}
                    >
                      {label.name}
                    </MenuItem>
                  );
                })}
              </Select>
              <Button
                color='primary'
                variant='contained'
                fullWidth
                type='submit'
              >
                Submit Report
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </ClickAwayListener>
  );
};
