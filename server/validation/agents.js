'use strict';

const isEmpty = require('is-empty');

module.exports = function validateAgentUpdate(data) {
  let errors = [];

  if (data.length > 0) {
    data.map((item, index) => {
      if (!item.zendeskId) {
        errors.push({ index: index, error: 'Missing zendeskId' });
      }
    });
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
