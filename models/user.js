var Professor = null,
    Student = null,
    Administrator = null,
    StudentTeacher = null,
    Comment = null,
    Forum = null,
    Log = null,
    Schedule = null,
    LogSite = null,
    Session = null;

module.exports = function(bookshelf) {
  var User = bookshelf.Model.extend({
    tableName: 'users',
    idAttribute: 'identity_card',
    hasTimestamps: ['created_at', 'updated_at'],
    professor: function() {
      return this.hasOne(Professor, 'identity_card');
    },
    student: function() {
      return this.hasOne(Student, 'identity_card');
    },
    administrator: function() {
      return this.hasOne(Administrator, 'identity_card');
    },
    studentTeacher: function() {
      return this.hasMany(StudentTeacher, 'identity_card');
    },
    comment: function() {
      return this.hasMany(Comment, 'identity_card');
    },
    forum: function() {
      return this.hasMany(Forum, 'identity_card');
    },
    log: function() {
      return this.hasMany(Log, 'identity_card');
    },
    schedule: function() {
      return this.hasMany(Schedule, 'identity_card');
    },
    logSite: function() {
      return this.hasMany(LogSite, 'identity_card');
    },
    login: function() {
      return this.hasOne(Session);
    }
  },
  {
    associate: function(models) {
      Professor = models.Professor;
      Student = models.Student;
      Administrator = models.Administrator;
      StudentTeacher = models.StudentTeacher;
      Comment = models.Comment;
      Forum = models.Forum;
      Log = models.Log;
      Schedule = models.Schedule;
      LogSite = models.LogSite;
      Session = models.Session;
    }
  });

  return User;
}