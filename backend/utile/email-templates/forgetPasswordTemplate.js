const env = require('../../config/env')

const forgetPasswordTemplate = function (token) {
    return `
          <div>
              <h1>Forget Password</h1>
              <p>Click on the link below to reset your password</p>
              <a href="${env.CLIENT_URL}/api/v1/reset-password/${token}">Reset Password</a>
          </div>
      `;
  };
  module.exports = forgetPasswordTemplate;