'use strict';

/**
 * @ngdoc overview
 * @name mobileRedirectorJsApp
 * @description
 * # mobileRedirectorJsApp
 *
 * Main module of the application.
 */
angular
  .module('mobileRedirectorJsApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
