'use strict';
const mongoose = require('mongoose');
const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');
const { app, runServer, closeServer } = require('../server');
const { JWT_SECRET, JWT_EXPIRY } = require('../config/config');
const User = require('../models/User');

chai.use(chaiHttp);

function tearDownDB() {
  console.warn('...Deleting Database...');
  return new Promise((resolve, reject) => {
    mongoose.connection
      .dropDatabase()
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        //console.error(err);
        reject(err);
      });
  });
}

function createFakeUser() {
  let password = faker.internet.password();
  return {
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    email: 'fakeuser@fullstory.com',
    password: password,
    password2: password,
    org: faker.commerce.productMaterial(),
  };
}

describe('\n========================\nAuthentication Endpoints\n========================\n', function () {
  let testUser, jwtToken;

  before(async () => {
    await runServer();
  });

  after(async () => {
    await tearDownDB();
    await closeServer();
  });

  describe('\n----------\nPOST /api/users/register\n----------\n', () => {
    // Create a user for our tests

    testUser = createFakeUser();

    // test signup route
    it('Should fail if email doesn\'t end in fullstory.com', () => {
      return chai
        .request(app)
        .post('/api/users/register')
        .send({
          name: '',
          email: '',
          password: '',
          password2: '',
          org: '',
        })
        .then(res => {
          expect(res).to.have.status(401);
          expect(res.body).to.be.an('Object');
          expect(res.body).to.have.keys('message');
          expect(res.body.message).to.equal('unauthorized');
        });
    });

    it('Should fail if required fields are blank', () => {
      return chai
        .request(app)
        .post('/api/users/register')
        .send({
          name: '',
          email: 'fakeuser@fullstory.com',
          password: '',
          password2: '',
          org: '',
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an('Object');
          expect(res.body).to.have.keys('name', 'password', 'password2', 'org');
          expect(res.body.name).to.equal('Name field is required');
          expect(res.body.org).to.equal('Org is required');
          expect(res.body.password).to.equal('Password must be at least 6 characters');
          expect(res.body.password2).equal('Confirm password field is required');
        });
    });

    it('Should create a user for a proper request', function () {
      return chai
        .request(app)
        .post('/api/users/register')
        .send(testUser)
        .then(res => {
          jwtToken = res.body.token;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('Object');
        });
    });

    it('Should fail is the email addess is already in use', function () {
      return chai
        .request(app)
        .post('/api/users/register')
        .send(testUser)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an('Object');
          expect(res.body).to.have.keys('code', 'message', 'reason');
          expect(res.body.message).to.equal('Email already exists');
        });
    });
  });

  describe('\n----------\nPOST /api/users/login\n----------\n', () => {
    //test signin route
    const signInBadEmail = {
      email: 'not@good.com',
      password: testUser.password,
    };

    const signInBadPass = {
      email: testUser.email,
      password: 'pumpernickle',
    };

    const goodUser = {
      email: testUser.email,
      password: testUser.password,
    };

    it('Should fail if email is incorrect', function () {
      return chai
        .request(app)
        .post('/api/users/login')
        .send(signInBadEmail)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('Should fail is password is incorrect', function () {
      return chai
        .request(app)
        .post('/api/users/login')
        .send(signInBadPass)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('Should succeed if credientals are correct', function () {
      return chai
        .request(app)
        .post('/api/users/login')
        .send(testUser)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('Object');
          expect(res.body).to.have.keys('token', 'success');
        });
    });
  });

  // Future Use
  // describe('\n----------\nPOST /refresh\n----------\n', () => {
  //   // test refresh route
  //   it('Should succeed in providing a new token', function() {
  //     return chai
  //       .request(app)
  //       .post('/refresh')
  //       .set('Authorization', `Bearer ${jwtToken}`)
  //       .then(res => {
  //         expect(res).to.have.status(200);
  //         expect(res.body).to.be.an('Object');
  //         expect(res.body).to.have.key('token');
  //       });
  //   });
  // });
});
