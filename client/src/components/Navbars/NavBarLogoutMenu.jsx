import React from 'react';

import {
  Paper,
  ClickAwayListener,
  MenuItem,
  MenuList,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import styles from '../../styles/jss/components/headerLinksStyle';

const useStyles = makeStyles(styles);

export const NavBarLogoutMenu = ({
  TransitionProps,
  placement,
  onClickAway,
  onClick,
}) => {
  const classes = useStyles();
  return (
    <Paper>
      <ClickAwayListener onClickAway={onClickAway}>
        <MenuList role='menu'>
          <MenuItem onClick={onClick} className={classes.dropdownItem}>
            Logout
          </MenuItem>
        </MenuList>
      </ClickAwayListener>
    </Paper>
  );
};
