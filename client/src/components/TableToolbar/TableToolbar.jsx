import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlightWarning:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  highlightSuccess:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.primary.main,
          backgroundColor: lighten(theme.palette.primary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.primary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));

const TableToolbar = props => {
  const classes = useToolbarStyles();
  const { numSelected, action, onChildClick } = props;

  const handleClick = event => {
    event.preventDefault();
    onChildClick(event);
  };

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlightWarning]:
          numSelected > 0 && action === 'deleteAgents',
        [classes.highlightSuccess]: numSelected > 0 && action === 'makeUpdates',
      })}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color='inherit'
          variant='subtitle1'
          component='div'
        >
          {numSelected} selected
        </Typography>
      ) : (
        ''
      )}

      {numSelected > 0 && action === 'deleteAgents' ? (
        <Tooltip title='Delete'>
          <IconButton aria-label='delete' onClick={handleClick}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        ''
      )}

      {numSelected > 0 && action === 'makeUpdates' ? (
        <Tooltip title='Apply Changes'>
          <Button
            variant='contained'
            color='primary'
            size='medium'
            className={classes.button}
            startIcon={<SaveIcon />}
            onClick={handleClick}
          >
            Save
          </Button>
        </Tooltip>
      ) : (
        ''
      )}
    </Toolbar>
  );
};

TableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  action: PropTypes.string.isRequired,
  onChildClick: PropTypes.func,
};

export default TableToolbar;
