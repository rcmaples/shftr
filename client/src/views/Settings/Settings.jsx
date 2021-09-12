import React, { useState, useEffect } from 'react';
let API_URL = '';

if (process.env.NODE_ENV === 'development') {
  API_URL = require('../../config/config').API_URL;
} else {
  API_URL = `https://shftr-api.herokuapp.com`;
}

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

// core components
import GridItem from '../../components/Grid/GridItem';
import GridContainer from '../../components/Grid/GridContainer';
import CustomInput from '../../components/CustomInput/CustomInput';
import Button from '../../components/CustomButtons/Button';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardBody from '../../components/Card/CardBody';
import CardFooter from '../../components/Card/CardFooter';

const { jwtToken } = localStorage;

const styles = {
  cardCategoryWhite: {
    color: 'rgba(255,255,255,.62)',
    margin: '0',
    fontSize: '14px',
    marginTop: '0',
    marginBottom: '0',
  },
  cardTitleWhite: {
    color: '#FFFFFF',
    marginTop: '0px',
    minHeight: 'auto',
    fontWeight: '300',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: '3px',
    textDecoration: 'none',
  },
};

const useStyles = makeStyles(styles);

const Settings = () => {
  const classes = useStyles();
  const [values, setValues] = useState({
    showPassword: false,
    connectionSucceeded: false,
    loading: false,
    zdSubdomain: '',
    zdUserString: '',
    zdToken: '',
  });

  useEffect(() => {
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };
    fetch(`/api/zendesk-configs`, options)
      .then(response => {
        const { status, statusText } = response;
        if (status >= 200 && status < 300) {
          return response.json();
        } else {
          throw { status, statusText };
        }
      })
      .then(data => {
        setValues({
          zdSubdomain: data.subdomain || '',
          zdUserString: data.userString || '',
        });
      })
      .catch(error => console.warn(error));
  }, []);

  const formChangeHandler = event => {
    let key = event.target.id;
    let value = event.target.value;
    setValues({ ...values, [key]: value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  const onZendeskSubmit = event => {
    event.preventDefault();
    let data = {
      subdomain: values.zdSubdomain,
      userString: values.zdUserString,
      zendeskToken: values.zdToken,
    };

    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    };

    fetch(`/api/zendesk-configs`, options)
      .then(response => {
        const { status, statusText } = response;
        if (status >= 200 && status < 300) {
          return response.json();
        } else {
          throw { status, statusText };
        }
      })
      .then(data => {
        setValues({ ...values, zdToken: '', connectionSucceeded: false });
      })
      .catch(error => console.warn(error));
  };

  const testConnection = event => {
    event.preventDefault();
    let data = {
      subdomain: values.zdSubdomain,
      userString: values.zdUserString,
      zendeskToken: values.zdToken,
    };

    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    };

    fetch(`/api/zendesk-test`, options)
      .then(response => {
        const { status, statusText } = response;
        if (status >= 200 && status < 300) {
          return response.json();
        } else {
          throw { status, statusText };
        }
      })
      .then(data => {
        setValues({ ...values, connectionSucceeded: true });
      })
      .catch(error => {
        setValues({ ...values, connectionSucceeded: false });
        console.warn(error);
      });
  };

  const onParamsSubmit = event => {
    event.preventDefault();
  };

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={6} xl={6}>
          <Card>
            <CardHeader color='primary'>
              <h4 className={classes.cardTitleWhite}> Zendesk Connection</h4>
              <p className={classes.cardCategoryWhite}>
                Details to connect to Zendesk
              </p>
            </CardHeader>
            <form onSubmit={onZendeskSubmit}>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      required
                      labelText='Zendesk Subdomain'
                      id='zdSubdomain'
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        required: true,
                        autoComplete: 'off',
                        onChange: formChangeHandler,
                        value: values.zdSubdomain,
                        error: !values.zdSubdomain,
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText='Zendesk User (joe@somedomain.com/token)'
                      id='zdUserString'
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        required: true,
                        autoComplete: 'off',
                        onChange: formChangeHandler,
                        value: values.zdUserString,
                        error: !values.zdSubdomain,
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText='Zended Token'
                      id='zdToken'
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        error: !values.zdSubdomain,
                        onChange: formChangeHandler,
                        value: values.zdToken,
                        autoComplete: 'off',
                        type: values.showPassword ? 'text' : 'password',
                        required: true,
                        name: 'Zendesk Token',
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              aria-label='toggle token visibility'
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                            >
                              {values.showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter>
                <Button onClick={testConnection} color='warning'>
                  Test Connection
                </Button>
                <Button
                  type='submit'
                  color='primary'
                  disabled={values.connectionSucceeded ? false : true}
                >
                  Submit Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={6} xl={6}>
          <Card>
            <CardHeader color='rose'>
              <h4 className={classes.cardTitleWhite}>Parameters</h4>
              <p className={classes.cardCategoryWhite}>
                Agent Assignment Parameters
              </p>
            </CardHeader>
            <form onSubmit={onParamsSubmit}>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText='Limit Per Agent'
                      id='agent-limit'
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        autoComplete: 'off',
                        disabled: true,
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText='Same Agent <-> Same Requester Time Period'
                      id='same-period'
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        autoComplete: 'off',
                        disabled: true,
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText='Load Balancing Period'
                      id='load-balance'
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        autoComplete: 'off',
                        type: 'text',
                        disabled: true,
                      }}
                    />
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter style={{ justifyContent: 'flex-end' }}>
                <Button type='submit' color='rose' disabled>
                  Submit Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
};

export default Settings;
