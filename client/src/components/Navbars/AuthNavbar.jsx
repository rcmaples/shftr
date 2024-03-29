import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import PropTypes from 'prop-types';

// @material-ui/core components
import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';

// @material-ui/icons
import Menu from '@material-ui/icons/Menu';

// core components
import Button from '../CustomButtons/Button';
import authNavbarStyle from '../../styles/jss/components/authNavbarStyle';

// actions
import { logoutUser, loginUser } from '../../actions/authActions';
class AuthNavbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  handleDrawerToggle = () => {
    this.setState({ open: !this.state.open });
  };
  // verifies if routeName is the one active (in browser input)
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? true : false;
  }
  componentDidUpdate(e) {
    if (e.history.location.pathname !== e.location.pathname) {
      this.setState({ open: false });
    }
  }
  render() {
    const { classes, color, brandText } = this.props;
    const appBarClasses = cx({
      [' ' + classes[color]]: color,
    });
    var list = null;
    return (
      <AppBar position='static' className={classes.appBar + appBarClasses}>
        <Toolbar className={classes.container}>
          <Hidden smDown>
            <div className={classes.flex}>
              <Button href='#' className={classes.title} color='transparent'>
                {brandText}
              </Button>
            </div>
          </Hidden>
          <Hidden mdUp>
            <div className={classes.flex}>
              <Button href='#' className={classes.title} color='transparent'>
                {brandText}
              </Button>
            </div>
          </Hidden>
          <Hidden smDown>{list}</Hidden>
          <Hidden mdUp>
            <Button
              className={classes.sidebarButton}
              color='transparent'
              justIcon
              aria-label='open drawer'
              onClick={this.handleDrawerToggle}
            >
              <Menu />
            </Button>
          </Hidden>
          <Hidden mdUp>
            <Hidden mdUp>
              <Drawer
                variant='temporary'
                anchor={'right'}
                open={this.state.open}
                classes={{
                  paper: classes.drawerPaper,
                }}
                onClose={this.handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
              >
                {list}
              </Drawer>
            </Hidden>
          </Hidden>
        </Toolbar>
      </AppBar>
    );
  }
}

AuthNavbar.propTypes = {
  classes: PropTypes.object.isRequired,
  color: PropTypes.oneOf(['primary', 'info', 'success', 'warning', 'danger']),
  brandText: PropTypes.string,
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
});

export default compose(
  withStyles(authNavbarStyle),
  connect(mapStateToProps, { logoutUser, loginUser })
)(AuthNavbar);
