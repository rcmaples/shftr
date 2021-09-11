import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// @material-ui/core components
import withStyles from '@material-ui/core/styles/withStyles';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Hidden from '@material-ui/core/Hidden';
import Poppers from '@material-ui/core/Popper';
import Divider from '@material-ui/core/Divider';
// @material-ui/icons
import Person from '@material-ui/icons/Person';
import Dashboard from '@material-ui/icons/Dashboard';

// core components
import Button from '../CustomButtons/Button';
import styles from '../../styles/jss/components/headerLinksStyle';

// actions
import { logoutUser } from '../../actions/authActions';
class AdminNavbarLinks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: null,
    };
  }

  openMenu = event => {
    if (this.state.menuOpen && this.state.menuOpen.contains(event.target)) {
      this.setState({ menuOpen: null });
    } else {
      this.setState({ menuOpen: event.currentTarget });
    }
  };

  onClickAway = () => {
    this.setState({ menuOpen: null });
  };

  handleLogout = () => {
    this.onClickAway();
    this.props.logoutUser();
  };

  handleSettings = () => {
    this.props.history.push('/admin/settings');
    this.onClickAway();
  };

  handleProfile = () => {
    this.props.history.push('/admin/user');
    this.onClickAway();
  };

  handleDashboard = () => {
    this.props.history.push('/admin/dashboard');
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        {/* <Button
          color={window.innerWidth > 959 ? 'transparent' : 'white'}
          justIcon={window.innerWidth > 959}
          simple={!(window.innerWidth > 959)}
          aria-label='Dashboard'
          className={classes.buttonLink}
          onClick={this.handleDashboard}
        >
          <Dashboard className={classes.icons} />
          <Hidden mdUp implementation='css'>
            <p className={classes.linkText}>Dashboard</p>
          </Hidden>
        </Button> */}

        <div className={classes.manager}>
          <Button
            color={window.innerWidth > 959 ? 'transparent' : 'white'}
            justIcon={window.innerWidth > 959}
            simple={!(window.innerWidth > 959)}
            aria-owns={this.state.menuOpen ? 'profile-menu-list-grow' : null}
            aria-haspopup='true'
            onClick={this.openMenu}
            className={classes.buttonLink}
          >
            <Person className={classes.icons} />
            <Hidden mdUp implementation='css'>
              <p className={classes.linkText}>Profile</p>
            </Hidden>
          </Button>
          <Poppers
            open={Boolean(this.state.menuOpen)}
            anchorEl={this.state.menuOpen}
            transition
            disablePortal
            className={
              classNames({ [classes.popperClose]: !this.state.menuOpen }) +
              ' ' +
              classes.popperNav
            }
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                id='profile-menu-list-grow'
                style={{
                  transformOrigin:
                    placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={this.onClickAway}>
                    <MenuList role='menu'>
                      {/* <MenuItem
                        onClick={this.handleProfile}
                        className={classes.dropdownItem}
                      >
                        Profile
                      </MenuItem>
                      <MenuItem
                        onClick={this.handleSettings}
                        className={classes.dropdownItem}
                      >
                        Settings
                      </MenuItem>
                      <Divider light /> */}
                      <MenuItem
                        onClick={this.handleLogout}
                        className={classes.dropdownItem}
                      >
                        Logout
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Poppers>
        </div>
      </div>
    );
  }
}

AdminNavbarLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object,
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
});

export default compose(
  withRouter,
  withStyles(styles),
  connect(mapStateToProps, { logoutUser })
)(AdminNavbarLinks);
