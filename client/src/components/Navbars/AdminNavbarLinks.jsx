import React, { useState } from 'react';
import { Popper } from '@material-ui/core';
import classNames from 'classnames';

// @material-ui/icons
import Person from '@material-ui/icons/Person';
import BugReportIcon from '@material-ui/icons/BugReport';

import { makeStyles } from '@material-ui/core/styles';
import styles from '../../styles/jss/components/headerLinksStyle';
const useStyles = makeStyles(styles);

import { NavBarButton } from './NavBarButton';
import { NavBarLogoutMenu } from './NavBarLogoutMenu';
import { BugReportForm } from '../BugReportForm/BugReportForm';

// actions
import { logoutUser } from '../../actions/authActions';

export const AdminNavbarLinks = () => {
  const classes = useStyles();
  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const [bugReportFormOpen, setBugReportFormOpen] = useState(null);

  const handleProfileMenu = event => {
    if (profileMenuOpen && profileMenuOpen.contains(event.target)) {
      setProfileMenuOpen(null);
    } else {
      setProfileMenuOpen(event.currentTarget);
    }
  };

  const handleBugReportClick = event => {
    if (bugReportFormOpen && bugReportFormOpen.contains(event.target)) {
      setBugReportFormOpen(null);
    } else {
      setBugReportFormOpen(event.currentTarget);
    }
  };

  const onClickAway = event => {
    if (!!profileMenuOpen) {
      setProfileMenuOpen(null);
    }
    if (!!bugReportFormOpen) {
      setBugReportFormOpen(null);
    }
  };

  const handleLogout = () => {
    onClickAway();
    logoutUser();
  };

  return (
    <div>
      <div className={classes.manager}>
        <NavBarButton
          icon={<BugReportIcon />}
          linkText='Report a Bug'
          onClick={handleBugReportClick}
          ariaOwns=''
          ariaPopup='true'
        />
        <Popper
          open={!!bugReportFormOpen}
          anchorEl={bugReportFormOpen}
          transition
          disablePortal
          className={
            classNames({ [classes.popperClose]: !bugReportFormOpen }) +
            ' ' +
            classes.popperNav +
            ' ' +
            classes.bugFormWrapper
          }
        >
          <BugReportForm onClickAway={onClickAway} />
        </Popper>
        <NavBarButton
          icon={<Person />}
          linkText='Profile'
          onClick={handleProfileMenu}
          ariaOwns={profileMenuOpen ? 'profile-menu-list-grow' : null}
          ariaPopup='true'
        />
        <Popper
          open={!!profileMenuOpen}
          anchorEl={profileMenuOpen}
          transition
          disablePortal
          className={
            classNames({ [classes.popperClose]: !profileMenuOpen }) +
            ' ' +
            classes.popperNav
          }
        >
          <NavBarLogoutMenu onClickAway={onClickAway} onClick={handleLogout} />
        </Popper>
      </div>
    </div>
  );
};
