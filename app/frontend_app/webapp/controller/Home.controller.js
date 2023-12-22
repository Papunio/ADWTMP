sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("frontendapp.controller.Home", {
      onInit: function () {
        const oView = this.getView();
        const oModel = new sap.ui.model.odata.v2.ODataModel("/v2/football/");
        const oMatchesModel = new JSONModel();
        const aTeams = [];

        const oPromise = new Promise((resolve) => {
          oModel.read("/Matches", {
            urlParameters: {
              $expand: "teams/up_,place",
            },
            success: (oData) => {
              oData.results.forEach((oMatchData) => {
                const oTeam1 = oMatchData.teams.results[0].up_;
                const oTeam2 = oMatchData.teams.results[1].up_;
                aTeams.push({
                  index: aTeams.length + 1,
                  team1: oTeam1,
                  team2: oTeam2,
                  place: oMatchData.place.name,
                });
              });
              resolve();
            },
            error: (oErr) => {
              MessageBox.error("{i18n>Something went wrong}");
              console.error(oErr.message);
            },
          });
        });

        oPromise.then(() => {
          oMatchesModel.setData(aTeams);
          oView.setModel(oMatchesModel, "MatchesModel");
          console.log(oView);
        });
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
      onMatchPress: function () {
        console.log("XD");
      },
      refreshView: function () {
        this.getView().byId("toBePlayedTable").getBinding("items").refresh();
      },
    });
  }
);
