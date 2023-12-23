sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("frontendapp.controller.MatchDetails", {
      onInit: function () {
        const oComponent = this.getOwnerComponent();
        const oMatchDetails = new JSONModel();
        oComponent.setModel(oMatchDetails, "matchDetailsModel");
        const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter
          .getRoute("MatchDetails")
          .attachPatternMatched(this._onPatternMatched, this);
      },
      _onPatternMatched: function (oEvent) {
        this.getView().bindElement({
          path: `/Matches/${oEvent.getParameter("arguments").MatchID}`,
        });

        const oModel = new sap.ui.model.odata.v2.ODataModel("/v2/football");

        const oMatchDetails =
          this.getOwnerComponent().getModel("matchDetailsModel");
        oModel.read(`/Matches/${oEvent.getParameter("arguments").MatchID}`, {
          urlParameters: {
            $expand: "teams",
          },
          success: (oData) => {
            const aTeams = oData.teams.results;
            aTeams.forEach((oTeam) => {
              // console.log(oTeam);
              oModel.read(`/Teams/${oTeam.up__ID}`, {
                success: (oTeamData) => {
                  console.log(oTeamData);
                },
              });
            });
          },
          error: (oErr) => {
            MessageBox.error("{i18n>Something went wrong}");
            console.error(oErr.message);
          },
        });
      },
    });
  }
);
