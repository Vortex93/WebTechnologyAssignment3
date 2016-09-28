var User = function (lastName, middleName, firstName, userName, password) {
    this.lastName = lastName;
    this.middleName = middleName;
    this.firstname = firstName;
    this.userName = userName;
    this.password = password;
};

User.prototype.getLastName =  function () {
    return this.lastName;
};

User.prototype.getMiddleName = function () {
    return this.middleName;
};

User.prototype.getfirstName = function () {
    return this.firstname;
};

User.prototype.getUserName = function () {
    return this.userName;
};

User.prototype.getPassword = function () {
    return this.password;
};

module.exports = User;