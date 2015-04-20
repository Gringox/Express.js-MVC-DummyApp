module.exports = {
  development: {
    from: 'no-reply@example.com',
    host: 'smtp.gmail.com', 
    secureConnection: true, 
    port: 465, 
    transportMethod: 'SMTP', 
    auth: {
      user: '',
      pass: ''
    }
  },
  staging: {
    from: 'no-reply@example.com',
    host: 'smtp.gmail.com', 
    secureConnection: true, 
    port: 465, 
    transportMethod: 'SMTP', 
    auth: {
      user: '',
      pass: ''
    }
  },
  production: {
    from: 'no-reply@example.com',
    host: 'smtp.gmail.com', 
    secureConnection: true, 
    port: 465, 
    transportMethod: 'SMTP', 
    auth: {
      user: '',
      pass: ''
    }
  }
};
