sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
  "use strict";

  return BaseController.extend("frontendapp.controller.PlayersList", {
    onInit: function () {},
    onNavButton: function () {
      window.history.go(-1);
    },
  });
});
