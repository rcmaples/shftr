import React, { useState, useEffect } from 'react';

import { GoogleIcon } from './icons';
import { darkStyle, lightStyle, disabledStyle, hoverStyle } from './styles';

export default function GoogleButton(props) {
  const [type, setType] = useState(props.type || 'light');
  const [disabled, setDisabled] = useState(props.disabled || false);
  const [label, setLabel] = useState(props.label || 'Sign in with Google');
  const [hoverState, setHoverState] = useState(props.hoverState || false);
  const styles = props.styles;
  const onClickHandler = props.onClick;

  const mouseOver = () => {
    if (!disabled) {
      setHoverState(true);
    }
  };

  const mouseOut = () => {
    if (!disabled) {
      setHoverState(false);
    }
  };

  const handleClick = e => {
    if (!disabled) {
      onClickHandler(e);
    }
  };

  const getStyles = props => {
    const baseStyle = type === 'light' ? lightStyle : darkStyle;
    if (hoverState) {
      return { ...baseStyle, ...hoverStyle, ...props };
    }

    if (disabled) {
      return { ...baseStyle, ...disabledStyle, ...props };
    }

    return { ...baseStyle, ...props };
  };

  return (
    <div
      role='button'
      onClick={handleClick}
      style={getStyles(styles)}
      onMouseOver={mouseOver}
      onMouseOut={mouseOut}
    >
      <GoogleIcon {...props} />
      <span>{label}</span>
    </div>
  );
}
