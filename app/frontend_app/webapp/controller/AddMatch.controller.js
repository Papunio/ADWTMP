sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
  "use strict";

  return BaseController.extend("frontendapp.controller.AddMatch", {
    onInit: function () {
      this.byId("matchDate").setMinDate(new Date());
    },
    onNavButton: function () {
      window.history.go(-1);
    },
  });
});
