sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend("frontendapp.controller.Home", {
      onInit: function () {
        const oModel = new sap.ui.model.odata.v2.ODataModel("/v2/football/");
      },
      onPressAddMatch: function () {
        const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("AddMatch");
      },
      onPressTeams: function () {
        const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("TeamsList");
      },
      onPressPlayers: function () {
        const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("PlayersList");
      },
    });
  }
);
