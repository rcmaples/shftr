import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';

// @material-ui/core components
import withStyles from '@material-ui/core/styles/withStyles';

import AuthNavbar from '../components/Navbars/AuthNavbar';
import Footer from '../components/Footer/AuthFooter';
import routes from '../routes';
import pagesStyle from '../styles/jss/layouts/authStyle';
import abstract from '../assets/img/abstract.jpg';

const switchRoutes = (
  <Switch>
    {routes.map((prop, key) => {
      if (prop.layout === '/auth') {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      }
      return null;
    })}
    <Redirect from='/auth' to='/auth/login-page' exact={true} />
  </Switch>
);

class Pages extends React.Component {
  componentDidMount() {
    document.body.style.overflow = 'unset';
  }

  getActiveRoute = routes => {
    let activeRoute = '';
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].name;
      }
    }
    return activeRoute;
  };
  render() {
    const { classes, ...rest } = this.props;
    return (
      <div>
        <AuthNavbar {...rest} />
        <div className={classes.wrapper}>
          <div
            className={classes.fullPage}
            style={{ backgroundImage: 'url(' + abstract + ')' }}
          >
            {switchRoutes}
            <Footer white />
          </div>
        </div>
      </div>
    );
  }
}

Pages.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(pagesStyle)(Pages);
