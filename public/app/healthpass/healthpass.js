/*
 * healthpass.js
 *
 * Loader for healthpass app, it is the core app (Dashboard is in healthdash, Mobile is in healthcordova)
 *
 */
angular.module('healthpass', [
  'healthpass.routes', // Router for the web and mobile app
  'healthpass.factories', // Factories and entity models
  'healthpass.controllers' // Controllers that contain business logic
  ])

.filter('pad', function() {
  return function(num) {
    if(num < 10) return '0' + num;
    else return num;
  };
})

// Location: mock user location for testing
.service('Location', function() {
  this.get = function() {
    return {lon:1, lat:1};
  }
})

// Useful for calendars
function DateFormat($scope, $timeout) {
  $scope.format = 'M/d/yy h:mm a';
  $scope.date = new Date();
  $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var tick = function() {
    $scope.date = new Date();
    $timeout(tick, 1000);
   };

  $timeout(tick, 1000);
}