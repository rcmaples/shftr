import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Link } from 'react-router-dom';

// @material-ui/core components
import withStyles from '@material-ui/core/styles/withStyles';

// core components
import GridContainer from '../../components/Grid/GridContainer';
import GridItem from '../../components/Grid/GridItem';
import Card from '../../components/Card/Card';
import CardBody from '../../components/Card/CardBody';
import Loader from '../../components/Loader/Loader';

// styles
import loginPageStyle from '../../styles/jss/views/loginPageStyle';

// actions
import { loginUser, setUserLoading } from '../../actions/authActions';
import GoogleButton from '../../components/GoogleButton/GoogleButton';
class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      loading: false,
    };
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/admin/scheduler');
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push('/admin/scheduler');
    }

    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors,
      });
    }
  }

  handleLoginError = () => {
    let errors = this.state.errors;
    if (
      Object.keys(errors).length != 0 &&
      errors.message === '401 Unauthorized'
    ) {
      return errors;
    } else {
      return;
    }
  };

  render() {
    const { classes } = this.props;
    let API_URL;
    if (process.env.NODE_ENV === 'development') {
      API_URL = require('../../config/config').API_URL;
    } else {
      API_URL = `https://shftr-api.herokuapp.com`;
    }

    return (
      <div className={classes.container}>
        <GridContainer justify='center'>
          <GridItem xs={12} sm={6} md={4}>
            <Loader open={this.props.auth.loading} />
            <Card className={classes[this.state.cardAnimaton]}>
              <CardBody>
                <GoogleButton
                  type='dark'
                  onClick={() => {
                    window.location.href = `/auth/google`;
                    console.log('click!');
                  }}
                />
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  loading: state.loading,
});

export default compose(
  withStyles(loginPageStyle),
  connect(mapStateToProps, {
    loginUser,
    setUserLoading,
  })
)(LoginPage);
