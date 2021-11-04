import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Hidden } from '@material-ui/core';

import Button from '../CustomButtons/Button';
import styles from '../../styles/jss/components/headerLinksStyle';

const useStyles = makeStyles(styles);

export const NavBarButton = ({
  icon,
  linkText,
  onClick,
  ariaOwns,
  ariaPopup,
}) => {
  const classes = useStyles();

  return (
    <Button
      color='transparent'
      justIcon={window.innerWidth > 959}
      simple={!(window.innerWidth > 959)}
      aria-owns={ariaOwns}
      aria-haspopup={ariaPopup}
      onClick={onClick}
      className={classes.buttonLink}
    >
      {icon}
      <Hidden mdUp implementation='css'>
        <p className={classes.linkText}>{linkText}</p>
      </Hidden>
    </Button>
  );
};
