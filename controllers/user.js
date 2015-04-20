var randtoken = require('rand-token'),
    crypto = require('crypto');

module.exports = {
  create: function(req, res) {
    if(req.body.password)
      req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex');
    else
      return res.status(400).send();

    req.app.locals.models.User
    .forge(req.body)
    .save(null, {
      method: 'insert'
    })
    .then(function(user) {
      res.status(201).json(user);
    })
    .otherwise(function() {
      res.status(409).send();
    });
  },
  readByMe: function(req, res) {
    req.app.locals.models.User
    .forge({
      identity_card: res.locals.user.identity_card
    })
    .fetch()
    .then(function(user) {
      if (user)
        res.json(user);
      else
        res.status(404).send();
    })
    .otherwise(function() {
      res.status(400).send();
    });
  },
  readAll: function(req, res) {
    req.app.locals.models.User
    .forge()
    .fetchAll()
    .then(function(users) {
      if (users.length)
        res.json(users);
      else
        res.status(404).send();
    });
  },
  updateByMe: function(req, res) {
    if(req.body.password)
      req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex');

    req.app.locals.models.User
    .forge({
      identity_card: res.locals.user.identity_card
    })
    .fetch()
    .then(function(user) {
      if (user)
        user.save(req.body, { 
          patch: true, 
          method: 'update' 
        })
        .then(function() {
          res.status(204).send();
        })
        .otherwise(function() {
          res.status(409).send();
        });
      else
        res.status(404).send();
    })
    .otherwise(function() {
      res.status(400).send();
    });
  },
  delete: function(req, res) {
    req.app.locals.models.User
    .forge({
      identity_card: req.params.identity_card
    })
    .fetch()
    .then(function(user) {
      if (user)
        user.destroy()
        .then(function() {
          res.status(204).send();
        })
        .otherwise(function() {
          res.status(409).send();
        });
      else
        res.status(404).send();
    })
    .otherwise(function() {
      res.status(400).send();
    });
  },
  belongsToSite: function(req, res, next) {
    var globals = req.app.locals.globals;

    req.app.locals.models.Administrator
    .forge({
      identity_card: res.locals.user.identity_card
    })
    .fetch()
    .then(function(administrator) {
      if (administrator) {
        res.locals.role = globals.roles.administrator;
        return next();
      }
      else {
        req.app.locals.models.ProfessorSite
        .forge({
          professor_identity_card: res.locals.user.identity_card,
          site_id: req.params.site_id
        })
        .fetch()
        .then(function(professorSite) {
          if (professorSite) {
            res.locals.role = globals.roles.professor;
            return next();
          }
          else {
            req.app.locals.models.StudentTeacher
            .forge({
              identity_card: res.locals.user.identity_card,
              site_id: req.params.site_id
            })
            .fetch()
            .then(function(studentTeacher) {
              if (studentTeacher) {
                res.locals.role = globals.roles.studentTeacher;
                return next();
              }
              else {
                req.app.locals.models.StudentSectionSite
                .forge()
                .where ({
                  student_identity_card: res.locals.user.identity_card
                })
                .fetchAll({withRelated: ['sectionSite']})
                .then(function(studentsSectionsSites) {
                  var _studentsSectionsSites = studentsSectionsSites.toJSON();

                  for (var k in _studentsSectionsSites) {
                    if (_studentsSectionsSites[k].sectionSite.site_id == req.params.site_id)
                    {
                      res.locals.role = globals.roles.student;
                      return next();
                    }
                  }

                  res.status(401).send();
                })
                .otherwise(function() {
                  res.status(400).send();
                });
              }
            })
            .otherwise(function() {
              res.status(400).send();
            });
          }
        })
        .otherwise(function() {
          res.status(400).send();
        });
      }
    })
    .otherwise(function() {
      res.status(400).send();
    });
  },
  passwordRecovery: function(req, res) {
    var globals = req.app.locals.globals;

    req.app.locals.models.User
    .forge({
      identity_card: req.params.identity_card
    })
    .fetch()
    .then(function(user){
      if (user)
      {
        if(user.get('recovery_token_date') && (Date.now() - new Date(user.get('recovery_token_date')).getTime() <= globals.email.time.recovery))
          return res.status(409).send();

        var data = {
          recovery_token: user.get('identity_card').toString() + '.' + randtoken.generate(64),
          recovery_token_date: new Date()
        };

        user.save(data, { patch: true, method: 'update' })
        .then(function() {
          res.locals.user = {
            name: user.get('name'),
            lastname: user.get('lastname'),
            recovery_token: user.get('recovery_token')
          };
          
          res.mailer.send('password_recovery', {
            to: user.get('email'),
            subject: 'Password change'
          }, function(err) {
            if(err)
              res.status(404).send();
            res.status(204).send();
          });
        });
      }
      else
        res.status(404).send();
    })
    .otherwise(function() {
      res.status(400).send();
    });
  },
  passwordChange: function(req, res) {
    var globals = req.app.locals.globals;

    req.app.locals.models.User
    .forge({
      identity_card: req.params.identity_card
    })
    .fetch()
    .then(function(user){
      if (user)
      {
        if(user.get('recovery_token') && user.get('recovery_token') != req.params.recovery_token)
          return res.status(400).send();

        if(req.body.password)
          req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex');
        else
          return res.status(400).send();

        if(Date.now() - user.get('recovery_token_date').getTime() > globals.email.time.change)
          return res.status(409).send();

        req.body.recovery_token = null;
        req.body.recovery_token_date = null;

        user.save(req.body, { patch: true, method: 'update' })
        .then(function() {
          res.status(204).send();
        })
        .otherwise(function() {
          res.status(409).send();
        });
      }
      else
        res.status(404).send();
    })
    .otherwise(function() {
      res.status(400).send();
    });
  },
  isStudentTeacher: function(req, res, next) {
    var globals = req.app.locals.globals;

    if (res.locals.role >= globals.roles.studentTeacher)
      return next();

    res.status(401).send();
  },
  isProfessor: function(req, res, next) {
    var globals = req.app.locals.globals;

    if (res.locals.role >= globals.roles.professor)
      return next();

    res.status(401).send();
  },
  options: function(req, res) {
    res.set('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
    res.json({
      name: 'Users',
      description: 'User CRUD',
      renders: 'application/json',
      parses: [
        'application/json', 
        'application/x-www-form-urlencoded', 
        'multipart/form-data'
      ]
    });
  }
};