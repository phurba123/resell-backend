var express = require('express');
var router = express.Router();
let userModel = require('../models/user-model');
let responseLib = require('../lib/responseLib');
let passwordLib = require('../lib/passwordLib');
let checkEmptyLib = require('../lib/checkEmptyLib');
let tokenLib = require('../lib/tokenLib');
const authModel = require('../models/auth-model');
const authMiddleware = require('../middlewares/auth-middleware');

/* GET users listing. */
// router.get('/', function (req, res, next) {
//   res.send('respond with a resource');
// });

/* Create new user */
router.post('/create', function (req, res, next) {
  console.log('CREATING USER')
  let apiResponse;

  //validating inputs, email and password are mandatory
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        if (checkEmptyLib.isEmpty(req.body.password)) {
          apiResponse = responseLib.generate(true, 'password is empty', 204, null)
          reject(apiResponse)
        }
        else {
          resolve(req);
        }
      }
      else {
        apiResponse = responseLib.generate(true, 'one or more parameter is missing', 204, null);
        reject(apiResponse);
      }
    });
  }//end of validate user input

  //creating user after input validation
  let createUser = () => {
    return new Promise((resolve, reject) => {
      userModel.findOne({ email: req.body.email })
        .exec((err, retrievedUserDetails) => {
          if (err) {
            apiResponse = responseLib.generate(true, 'server error', 500, null)
            reject(apiResponse)
          } else if (checkEmptyLib.isEmpty(retrievedUserDetails)) {
            // new user object
            let newUser = new userModel({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              password: passwordLib.hashPassword(req.body.password),
              createdOn: new Date(),
              updatedOn: new Date(),
              contactNo: req.body.contactNo,
              address: req.body.address,
              profileImg: req.body.profileImg
            });

            newUser.save((err, newUserDetail) => {
              if (err) {
                apiResponse = responseLib.generate(true, 'server error while creating new user', 500, null)
                reject(apiResponse)
              } else {
                apiResponse = responseLib.generate(false, 'User Created', 200, newUserDetail)
                resolve(apiResponse)
              }
            })
          } else {
            apiResponse = responseLib.generate(true, 'User Already Present With this Email', 403, null)
            reject(apiResponse)
          }
        })
    })
  }// end create user function


  validateUserInput(req, res)
    .then(createUser)
    .then((resolve) => {
      console.log('inside resolve')
      res.send(resolve);
    })
    .catch((error) => {
      res.send(error)
    })
})
/*    End of create user route */

// router.put('/edit/')

/**
 * Route for login
 */
router.post('/login', (req, res, next) => {
  let apiResponse;
  //using promise for finding user
  let findUser = () => {
    //function for finding a user
    console.log('find user');
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        userModel.findOne({ email: req.body.email }, (err, userDetails) => {
          if (err) {
            apiResponse = responseLib.generate(true, 'failed to find user detail', 500, null);
            reject(apiResponse)
          }
          else if (checkEmptyLib.isEmpty(userDetails)) {
            //userdetails is empty so it means that the user with given email is not 
            //registered yet
            apiResponse = responseLib.generate(true, 'no user details found', 404, null);
            reject(apiResponse)
          }
          else {
            resolve(userDetails);
          }
        })
      }
      else {
        //if email is not present then execute this else
        apiResponse = responseLib.generate(true, 'email is missing', 400, null);
        reject(apiResponse)
      }
    });//end of promise
  }//end of findUser

  let validatePassword = (retrievedUserDetails) => {
    //validating password provided
    return new Promise((resolve, reject) => {
      passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
        if (err) {
          apiResponse = responseLib.generate(true, 'login failed', 500, null);
          reject(apiResponse);
        }
        else if (isMatch) {
          resolve(retrievedUserDetails);
        }
        else {
          apiResponse = responseLib.generate(true, 'wrong password.login failed', 400, null);
          reject(apiResponse);
        }
      })
    })
  }//end of validating password

  let generateToken = (userDetails) => {
    //generating token on validation
    return new Promise((resolve, reject) => {
      tokenLib.generateToken(userDetails, (error, tokenDetails) => {
        if (error) {
          console.log(error);
          apiResponse = responseLib.generate(true, 'failed to generate token', 500, null);
          reject(apiResponse);
        }
        else {
          tokenDetails.userDetails = userDetails;
          resolve(tokenDetails);
        }
      })
    })
  }//end of generating token

  let saveToken = (tokenDetails) => {

    return new Promise((resolve, reject) => {
      authModel.findOne({ 'userId': tokenDetails.userDetails._id }, (err, retrievedTokenDetails) => {
        if (err) {
          apiResponse = responseLib.generate(true, err.message, 500, null);
          reject(apiResponse);
        }
        else if (checkEmptyLib.isEmpty(retrievedTokenDetails)) {
          //save new auth
          let newauthModel = new authModel(
            {
              userId: tokenDetails.userDetails._id,
              authToken: tokenDetails.token,
              tokenSecret: tokenDetails.tokenSecret,
              tokenGenerationTime: new Date()
            }
          );

          newauthModel.save((err, newTokenDetails) => {
            if (err) {
              apiResponse = responseLib.generate(true, err.message, 500, null);
              reject(apiResponse)
            }
            else {
              let responseBody = {
                authToken: newTokenDetails.authToken,
                userDetails: tokenDetails.userDetails
              }

              resolve(responseBody)
            }
          })
        }
        else {
          //already present,so,update it
          retrievedTokenDetails.authToken = tokenDetails.token;
          retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret;
          retrievedTokenDetails.tokenGenerationTime = new Date()

          retrievedTokenDetails.save((err, newTokenDetails) => {
            if (err) {
              apiResponse = responseLib.generate(true, 'error while updating auth token', 500, null);
              reject(apiResponse)
            }
            else {
              //console.log('new token details after log in'+newTokenDetails.authToken)
              console.log('newtokendetails : ' + newTokenDetails)
              let response = {
                authToken: newTokenDetails.authToken,
                userDetails: tokenDetails.userDetails
              }
              resolve(response)
            }
          })
        }
      })
    });//end of promise for saving token
  }//end of savetoken function

  findUser(req, res)
    .then(validatePassword)
    .then(generateToken)
    .then(saveToken)
    .then((resolve) => {
      apiResponse = responseLib.generate(false, 'login successfull', 200, resolve);
      res.status(200);
      res.send(apiResponse);
    })
    .catch((error) => {
      console.log('err: ', error);
      res.status(error.status)
      res.send(error);
    })
})

router.post('/logout', authMiddleware.isAuthorized, (req, res, next) => {
  let apiResponse;
  console.log('req.body : ', req.body)
  authModel.findOneAndRemove({ userId: req.body._id }, (err, result) => {
    if (err) {
      console.log(err)
      apiResponse = responseLib.generate(true, `error occurred: ${err.message}`, 500, null)
      res.status(500).send(apiResponse)
    } else if (checkEmptyLib.isEmpty(result)) {
      apiResponse = responseLib.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
      res.status(400).send(apiResponse)
    } else {
      apiResponse = responseLib.generate(false, 'Logged Out Successfully', 200, null)
      res.status(200).send(apiResponse)
    }
  })

})

module.exports = router;
