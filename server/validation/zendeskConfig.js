'use strict';

const Validator = require('validator');
const isEmpty = require('is-empty');

function validateZendeskTest(data) {
  let errors = {};
  let { subdomain, userString, zendeskToken } = data;
  subdomain = !isEmpty(subdomain) ? subdomain : '';
  userString = !isEmpty(userString) ? userString : '';
  zendeskToken = !isEmpty(zendeskToken) ? zendeskToken : '';
  // Is subdomain present?
  if (Validator.isEmpty(data.subdomain)) {
    errors.subdomain = 'Subdomain field is required';
  }

  // Is the user string present?
  if (Validator.isEmpty(data.userString)) {
    errors.userString = 'UserString field is required';
  }

  // Is the token present?
  if (Validator.isEmpty(data.zendeskToken)) {
    errors.zendeskToken = 'zendeskToken field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

function validateZendeskInformation(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.subdomain = !isEmpty(data.subdomain) ? data.subdomain : '';
  data.userString = !isEmpty(data.userString) ? data.userString : '';
  data.zendeskToken = !isEmpty(data.zendeskToken) ? data.zendeskToken : '';

  // Is subdomain present?
  if (Validator.isEmpty(data.subdomain)) {
    errors.subdomain = 'Subdomain field is required';
  }

  // Is the user string present?
  if (Validator.isEmpty(data.userString)) {
    errors.userString = 'UserString field is required';
  }

  // Is the token present?
  if (Validator.isEmpty(data.zendeskToken)) {
    errors.zendeskToken = 'zendeskToken field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

module.exports = {
  validateZendeskTest,
  validateZendeskInformation,
};
