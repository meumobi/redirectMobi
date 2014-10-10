angular.module("mobile-angular-ui.active-links", []).run([
  "$rootScope", function($rootScope) {
    return angular.forEach(["$locationChangeSuccess", "$includeContentLoaded"], function(evtName) {
      return $rootScope.$on(evtName, function() {
        var newPath;
        newPath = window.location.href;
        angular.forEach(document.links, function(domLink) {
          var link;
          link = angular.element(domLink);
          if (domLink.href === newPath) {
            link.addClass("active");
          } else {
            link.removeClass("active");
          }
          return link = null;
        });
        return newPath = null;
      });
    });
  }
]);

angular.module("mobile-angular-ui.directives.capture", [])

.run([
  "CaptureService", "$rootScope", function(CaptureService, $rootScope) {
    $rootScope.$on('$routeChangeStart', function() {
      CaptureService.resetAll();
    });
  }
])

.factory("CaptureService", [
  "$compile", function($compile) {
    var yielders = {};

    return {
      resetAll: function() {
        for (name in yielders) {
          this.resetYielder(name);
        }
      },
      
      resetYielder: function(name) {
        var b = yielders[name];
        this.setContentFor(name, b.defaultContent, b.defaultScope);
      },

      putYielder: function(name, element, defaultScope, defaultContent) {
        var yielder = {};
        yielder.name = name;
        yielder.element = element;
        yielder.defaultContent = defaultContent || "";
        yielder.defaultScope = defaultScope;
        yielders[name] = yielder;
      },

      getYielder: function(name) {
        return yielders[name];
      },

      removeYielder: function(name) {
        delete yielders[name];
      },
      
      setContentFor: function(name, content, scope) {
        var b = yielders[name];
        if (!b) {
          return;
        }
        b.element.html(content);
        $compile(b.element.contents())(scope);
      }

    };
  }
])

.directive("contentFor", [
  "CaptureService", function(CaptureService) {
    return {
      compile: function(tElem, tAttrs) {
        var rawContent = tElem.html();
        if(tAttrs.duplicate == null) {
          // no need to compile anything!
          tElem.html("");
        }
        return function postLink(scope, elem, attrs) {
          CaptureService.setContentFor(attrs.contentFor, rawContent, scope);
          if (attrs.duplicate == null) {
            elem.remove();
          }
        }
      }
    };
  }
])

.directive("yieldTo", [
  "$compile", "CaptureService", function($compile, CaptureService) {
    return {
      link: function(scope, element, attr) {
        CaptureService.putYielder(attr.yieldTo, element, scope, element.html());
        element.contents().remove();

        scope.$on('$destroy', function(){
          CaptureService.removeYielder(attr.yieldTo);
        });
      }
    };
  }
]);

angular.module('mobile-angular-ui.directives.carousel', [])

.run(["$rootScope", function($rootScope) {
    
    $rootScope.carouselPrev = function(id) {
      $rootScope.$emit("mobile-angular-ui.carousel.prev", id);
    };
    
    $rootScope.carouselNext = function(id) {
      $rootScope.$emit("mobile-angular-ui.carousel.next", id);
    };
    
    var carouselItems = function(id) {
      var elem = angular.element(document.getElementById(id));
      var res = angular.element(elem.children()[0]).children();
      elem = null;
      return res;
    };

    var findActiveItemIndex = function(items) {
      var idx = -1;
      var found = false;

      for (var _i = 0; _i < items.length; _i++) {
        item = items[_i];
        idx += 1;
        if (angular.element(item).hasClass('active')) {
          found = true;
          break;
        }
      }

      if (found) {
        return idx;
      } else {
        return -1;
      }

    };

    $rootScope.$on("mobile-angular-ui.carousel.prev", function(e, id) {
      var items = carouselItems(id);
      var idx = findActiveItemIndex(items);
      var lastIdx = items.length - 1;

      if (idx !== -1) {
        angular.element(items[idx]).removeClass("active");
      }

      if (idx <= 0) {
        angular.element(items[lastIdx]).addClass("active");
      } else {
        angular.element(items[idx - 1]).addClass("active");
      }

      items = null;
      idx = null;
      lastIdx = null;
    });

    $rootScope.$on("mobile-angular-ui.carousel.next", function(e, id) {
      var items = carouselItems(id);
      var idx = findActiveItemIndex(items);
      var lastIdx = items.length - 1;
      
      if (idx !== -1) {
        angular.element(items[idx]).removeClass("active");
      }
      
      if (idx === lastIdx) {
        angular.element(items[0]).addClass("active");
      } else {
        angular.element(items[idx + 1]).addClass("active");
      }
      
      items = null;
      idx = null;
      lastIdx = null;
    });
  }
]);

// Provides touch events via fastclick.js
angular.module('mobile-angular-ui.fastclick', [])

.run([
  '$window', '$document', function($window, $document) {
    $window.addEventListener("load", (function() {
       FastClick.attach($document[0].body);
    }), false);
  }
])

.directive("select", function() {
  return {
    replace: false,
    restrict: "E",
    link: function(scope, element, attr) {
      element.addClass("needsclick");
    }
  };
})

.directive("input", function() {
  return {
    replace: false,
    restrict: "E",
    link: function(scope, element, attr) {
      element.addClass("needsclick");
    }
  };
})

.directive("textarea", function() {
  return {
    replace: false,
    restrict: "E",
    link: function(scope, element, attr) {
      element.addClass("needsclick");
    }
  };
})

angular.module('mobile-angular-ui.directives.forms', [])

.directive("bsFormControl", function() {
  var bs_col_classes = {};
  var bs_col_sizes = ['xs', 'sm', 'md', 'lg'];
  
  for (var i = 0; i < bs_col_sizes.length; i++) {
    for (var j = 1; j <= 12; j++) {
      bs_col_classes['col-' + bs_col_sizes[i] + "-" + j] = true;
    }
  };
  
  function separeBsColClasses(clss) {
    var intersection = "";
    var difference = "";

    for (var i = 0; i < clss.length; i++) {
        var v = clss[i];
        if (v in bs_col_classes) { 
          intersection += (v + " "); 
        } else {
          difference += (v + " ");
        }
    }

    return {i: intersection.trim(), d: difference.trim()};
  }

  return {
    replace: true,
    require: "ngModel",
    link: function(scope, elem, attrs) {

      if (attrs.labelClass == null) {
        attrs.labelClass = "";
      }

      if (attrs.id == null) {
        attrs.id = attrs.ngModel.replace(".", "_") + "_input";
      }
      
      if ((elem[0].tagName == "SELECT") || ((elem[0].tagName == "INPUT" || elem[0].tagName == "TEXTAREA") && (attrs.type != "checkbox" && attrs.type != "radio"))) {
        elem.addClass("form-control");
      }
      
      var label = angular.element("<label for=\"" + attrs.id + "\" class=\"control-label\">" + attrs.label + "</label>");
      var w1 = angular.element("<div class=\"form-group row\"></div>"); 
      var w2 = angular.element("<div class=\"form-control-wrapper\"></div>");
      
      var labelColClasses = separeBsColClasses(attrs.labelClass.split(/\s+/));
      if (labelColClasses.i == "") {
        label.addClass("col-xs-12");
      }
      label.addClass(attrs.labelClass);

      var elemColClasses = separeBsColClasses(elem[0].className.split(/\s+/));
      elem.removeClass(elemColClasses.i);
      w2.addClass(elemColClasses.i);
      if (elemColClasses.i == "") {
        w2.addClass("col-xs-12");
      }
      elem.wrap(w1).wrap(w2);
      elem.parent().parent().prepend(label);
      elem.attr('id', attrs.id);

      label = w1 = w2 = labelColClasses = elemColClasses = null;
    }
  };
})

.directive("switch", function() {
  return {
    restrict: "EA",
    replace: true,
    scope: {
      model: "=ngModel",
      changeExpr: "@ngChange",
      disabled: "@"
    },
    template: "<div class='switch' ng-class='{active: model}'><div class='switch-handle'></div></div>",
    link: function(scope, elem, attrs) {

      elem.on('click tap', function(){
        if (attrs.disabled == null) {
          scope.model = !scope.model;
          scope.$apply();

          if (scope.changeExpr != null) {
            scope.$parent.$eval(scope.changeExpr);
          };
        }
      });

      elem.addClass('switch-transition-enabled');
    }
  };
});
angular.module('mobile-angular-ui.directives.navbars', [])

.directive('navbarAbsoluteTop', function() {
  return {
    replace: false,
    restrict: "C",
    link: function(scope, elem, attrs) {
      elem.parent().addClass('has-navbar-top');
    }
  };
})

.directive('navbarAbsoluteBottom', function() {
  return {
    replace: false,
    restrict: "C",
    link: function(scope, elem, attrs) {
      elem.parent().addClass('has-navbar-bottom');
    }
  };
});
angular.module('mobile-angular-ui.directives.overlay', []).directive('overlay', [
  "$compile", function($compile) {
    return {
        compile: function(tElem, tAttrs) {
            var rawContent = tElem.html();
            return function postLink(scope, elem, attrs) {
                var active = "";
                var body = rawContent;
                var id = attrs.overlay;

                if (attrs["default"] != null) {
                  var active = "default='" + attrs["default"] + "'";
                }

                var html = "<div class=\"overlay\" id=\"" + id + "\" toggleable " + active + " parent-active-class=\"overlay-in\" active-class=\"overlay-show\">\n  <div class=\"overlay-inner\">\n    <div class=\"overlay-background\"></div>\n    <a href=\"#" + id + "\" toggle=\"off\" class=\"overlay-dismiss\">\n      <i class=\"fa fa-times-circle-o\"></i>\n    </a>\n    <div class=\"overlay-content\">\n      <div class=\"overlay-body\">\n        " + body + "\n      </div>\n    </div>\n  </div>\n</div>";
                elem.remove();

                var sameId = angular.element(document.getElementById(id));

                if (sameId.length > 0 && sameId.hasClass('overlay')) {
                  sameId.remove();
                }

                body = angular.element(document.body);
                body.prepend($compile(html)(scope));

                if (attrs["default"] === "active") {
                   body.addClass('overlay-in');
                }
            }
        }
    };
  }
]);

angular.module("mobile-angular-ui.directives.panels", [])

.directive("bsPanel", function() {
  return {
    restrict: 'EA',
    replace: true,
    scope: false,
    transclude: true,
    link: function(scope, elem, attrs) {
      elem.removeAttr('title');
    },
    template: function(elems, attrs) {
      var heading = "";
      if (attrs.title) {
        heading = "<div class=\"panel-heading\">\n  <h2 class=\"panel-title\">\n    " + attrs.title + "\n  </h2>\n</div>";
      }
      return "<div class=\"panel\">\n  " + heading + "\n  <div class=\"panel-body\">\n     <div ng-transclude></div>\n  </div>\n</div>";
    }
  };
});
angular.module('mobile-angular-ui.pointer-events', []).run([
  '$document', function($document) {
    return angular.element($document).on("click tap", function(e) {
      var target;
      target = angular.element(e.target);
      if (target.hasClass("disabled")) {
        e.preventDefault();
        e.stopPropagation();
        target = null;
        return false;
      } else {
        target = null;
        return true;
      }
    });
  }
]);

 // Provides a scrollable implementation based on Overthrow
 // Many thanks to pavei (https://github.com/pavei) to submit
 // basic implementation

angular.module("mobile-angular-ui.scrollable", [])

.directive("scrollableContent", [
  function() {
    return {
      replace: false,
      restrict: "C",
      link: function(scope, element, attr) {
        if (overthrow.support !== "native") {
          element.addClass("overthrow");
          overthrow.forget();
          return overthrow.set();
        }
      }
    };
  }
]);
angular.module('mobile-angular-ui.directives.sidebars', [])

.directive('sidebar', ['$document', '$rootScope', function($document, $rootScope) {
  return {
    replace: false,
    restrict: "C",
    link: function(scope, elem, attrs) {
      var shouldCloseOnOuterClicks = true;
      
      if( attrs.closeOnOuterClicks == 'false' || attrs.closeOnOuterClicks == '0') {
        shouldCloseOnOuterClicks = false;
      }

      if (elem.hasClass('sidebar-left')) {
        elem.parent().addClass('has-sidebar-left');
      }

      if (elem.hasClass('sidebar-right')) {
        elem.parent().addClass('has-sidebar-right');
      }

      var isAncestorOrSelf = function(element, target) {
        var parent = element;

        while (parent.length > 0) {
            if (parent[0] === target[0]) {
                parent = null;     
                return true;
            }
            parent = parent.parent();
        }

        parent = null;
        return false;
      };

      var closeOnOuterClicks = function(e) {
        if(! isAncestorOrSelf(angular.element(e.target), elem)) {
            $rootScope.toggle(attrs.id, 'off');
            e.preventDefault()
            return false;
        }
      }
      
      var clearCb1 = angular.noop();
      
      if (shouldCloseOnOuterClicks) {
        clearCb1 = $rootScope.$on('mobile-angular-ui.toggle.toggled', function(e, id, active){
          if(id == attrs.id) {
            if(active) {
              setTimeout(function(){
                $document.on('click tap', closeOnOuterClicks);
              }, 300);
            } else {
              $document.unbind('click tap', closeOnOuterClicks);
            }
          }
        });
      }

      scope.$on('$destroy', function(){
        clearCb1();
        $document.unbind('click tap', closeOnOuterClicks);
      });

    }
  };
}]);

angular.module('mobile-angular-ui.directives.toggle', [])

.factory('ToggleHelper', [
  '$rootScope', function($rootScope) {
    return {
      
      events: {
        toggle: "mobile-angular-ui.toggle.toggle",
        toggleByClass: "mobile-angular-ui.toggle.toggleByClass",
        togglerLinked: "mobile-angular-ui.toggle.linked",
        toggleableToggled: "mobile-angular-ui.toggle.toggled"
      },

      commands: {
        alternate: "toggle",
        activate: "on",
        deactivate: "off"
      },

      toggle: function(target, command) {
        if (command == null) {
          command = "toggle";
        }
        $rootScope.$emit(this.events.toggle, target, command);
      },

      toggleByClass: function(targetClass, command) {
        if (command == null) {
          command = "toggle";
        }
        $rootScope.$emit(this.events.toggleByClass, targetClass, command);
      },

      notifyToggleState: function(elem, attrs, toggleState) {
        $rootScope.$emit(this.events.toggleableToggled, attrs.id, toggleState, attrs.exclusionGroup);
      },

      toggleStateChanged: function(elem, attrs, toggleState) {
        this.updateElemClasses(elem, attrs, toggleState);
        this.notifyToggleState(elem, attrs, toggleState);
      },

      applyCommand: function(command, oldState) {
        switch (command) {
          case this.commands.activate:
            return true;
          case this.commands.deactivate:
            return false;
          case this.commands.alternate:
            return !oldState;
        }
      },

      updateElemClasses: function(elem, attrs, active) {

        if (active) {
          if (attrs.activeClass) {
            elem.addClass(attrs.activeClass);
          }
          if (attrs.inactiveClass) {
            elem.removeClass(attrs.inactiveClass);
          }
          var parent = elem.parent();
          if (attrs.parentActiveClass) {
            parent.addClass(attrs.parentActiveClass);
          }
          if (attrs.parentInactiveClass) {
             parent.removeClass(attrs.parentInactiveClass);
          }
        } else {
          if (attrs.inactiveClass) {
            elem.addClass(attrs.inactiveClass);
          }
          if (attrs.activeClass) {
            elem.removeClass(attrs.activeClass);
          }
          var parent = elem.parent();
          if (attrs.parentInactiveClass) {
            parent.addClass(attrs.parentInactiveClass);
          }
          if (attrs.parentActiveClass) {
             parent.removeClass(attrs.parentActiveClass);
          }
        }
      }
    };
  }
])

.run([
  "$rootScope", "ToggleHelper", function($rootScope, ToggleHelper) {
    
    $rootScope.toggle = function(target, command) {
      if (command == null) {
        command = "toggle";
      }
      ToggleHelper.toggle(target, command);
    };

    $rootScope.toggleByClass = function(targetClass, command) {
      if (command == null) {
        command = "toggle";
      }
      ToggleHelper.toggleByClass(targetClass, command);
    };
  }
])

.directive('toggle', [
  "$rootScope", "ToggleHelper", function($rootScope, ToggleHelper) {
    return {
      restrict: "A",
      link: function(scope, elem, attrs) {
        var command = attrs.toggle || ToggleHelper.commands.alternate;
        var target = attrs.target;
        var targetClass = attrs.targetClass;
        var bubble = attrs.bubble === "true" || attrs.bubble === "1" || attrs.bubble === 1 || attrs.bubble === "" || attrs.bubble === "bubble";
        
        if ((!target) && attrs.href) {
          target = attrs.href.slice(1);
        }
        
        if (!(target || targetClass)) {
          throw "'target' or 'target-class' attribute required with 'toggle'";
        }
        
        elem.on("click tap", function(e) {
          var angularElem = angular.element(e.target);
          if (!angularElem.hasClass("disabled")) {
            if (target != null) {
              ToggleHelper.toggle(target, command);
            }
            if (targetClass != null) {
              ToggleHelper.toggleByClass(targetClass, command);
            }
            if (!bubble) {
              e.preventDefault();
              return false;
            } else {
              return true;
            }
          }
        });

        var unbindUpdateElemClasses = $rootScope.$on(ToggleHelper.events.toggleableToggled, function(e, id, newState) {
          if (id === target) {
            ToggleHelper.updateElemClasses(elem, attrs, newState);
          }
        });

        if (target != null) {
          $rootScope.$emit(ToggleHelper.events.togglerLinked, target);
        }

        scope.$on('$destroy', unbindUpdateElemClasses);
      }
    };
  }
])

.directive('toggleable', [
  "$rootScope", "ToggleHelper", function($rootScope, ToggleHelper) {
    return {
      restrict: "A",
      link: function(scope, elem, attrs) {        
        var toggleState = false;
        
        if (attrs["default"]) {
          switch (attrs["default"]) {
            case "active":
              toggleState = true;
              break;
            case "inactive":
              toggleState = false;
          }
          ToggleHelper.toggleStateChanged(elem, attrs, toggleState);
        }
        
        var unbindToggle = $rootScope.$on(ToggleHelper.events.toggle, function(e, target, command) {
          var oldState;
          if (target === attrs.id) {
            oldState = toggleState;
            toggleState = ToggleHelper.applyCommand(command, oldState);
            if (oldState !== toggleState) {
              ToggleHelper.toggleStateChanged(elem, attrs, toggleState);
            }
          }
        });
        
        var unbindToggleByClass = $rootScope.$on(ToggleHelper.events.toggleByClass, function(e, targetClass, command) {
          var oldState;
          if (elem.hasClass(targetClass)) {
            oldState = toggleState;
            toggleState = ToggleHelper.applyCommand(command, oldState);
            if (oldState !== toggleState) {
              ToggleHelper.toggleStateChanged(elem, attrs, toggleState);
            }
          }
        });
        
        var unbindToggleableToggled = $rootScope.$on(ToggleHelper.events.toggleableToggled, function(e, target, newState, sameGroup) {
          if (newState && (attrs.id !== target) && (attrs.exclusionGroup === sameGroup) && (attrs.exclusionGroup != null)) {
            toggleState = false;
            ToggleHelper.toggleStateChanged(elem, attrs, toggleState);
          }
        });
        
        var unbindTogglerLinked = $rootScope.$on(ToggleHelper.events.togglerLinked, function(e, target) {
          if (attrs.id === target) {
            ToggleHelper.notifyToggleState(elem, attrs, toggleState);
          }
        });
        
        scope.$on('$destroy', function() {
          unbindToggle();
          unbindToggleByClass();
          unbindToggleableToggled();
          unbindTogglerLinked();
        });
      }
    };
  }
]);

angular.module("mobile-angular-ui", [
  'mobile-angular-ui.pointer-events',
  'mobile-angular-ui.active-links',
  'mobile-angular-ui.fastclick',
  'mobile-angular-ui.scrollable',
  'mobile-angular-ui.directives.toggle',
  'mobile-angular-ui.directives.overlay',
  'mobile-angular-ui.directives.forms',
  'mobile-angular-ui.directives.panels',
  'mobile-angular-ui.directives.capture',
  'mobile-angular-ui.directives.sidebars',
  'mobile-angular-ui.directives.navbars',
  'mobile-angular-ui.directives.carousel'
 ]);