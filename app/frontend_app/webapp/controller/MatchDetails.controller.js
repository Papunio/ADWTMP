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
        const oTeam1Details = new JSONModel();
        const oTeam2Details = new JSONModel();

        oComponent.setModel(oTeam1Details, "team1DetailsModel");
        oComponent.setModel(oTeam2Details, "team2DetailsModel");
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

        const oTeam1Details =
          this.getOwnerComponent().getModel("team1DetailsModel");
        const oTeam2Details =
          this.getOwnerComponent().getModel("team2DetailsModel");

        const oPromise = new Promise((resolve) => {
          oModel.read(`/Matches/${oEvent.getParameter("arguments").MatchID}`, {
            urlParameters: {
              $expand: "teams",
            },
            success: (oData) => {
              const aTeams = oData.teams.results;
              // TUTAJ ŁADNIEJ (DRY) PĘTLA CZY COS XD
              oModel.read(`/Teams/${aTeams[0].up__ID}`, {
                urlParameters: {
                  $expand: "players",
                },
                success: (oTeamData) => {
                  const aTeam1Data = {};
                  aTeam1Data.name = oTeamData.name;
                  const aPlayers = [];

                  oTeamData.players.results.forEach((oPlayer) => {
                    oModel.read(`/Players/${oPlayer.player_ID}`, {
                      success: (oPlayerData) => {
                        aPlayers.push(oPlayerData);
                      },
                    });
                  });
                  aTeam1Data.players = aPlayers;
                  oTeam1Details.setData(aTeam1Data);
                },
              });

              oModel.read(`/Teams/${aTeams[1].up__ID}`, {
                urlParameters: {
                  $expand: "players",
                },
                success: (oTeamData) => {
                  const aTeam2Data = {};
                  aTeam2Data.name = oTeamData.name;
                  const aPlayers = [];

                  oTeamData.players.results.forEach((oPlayer) => {
                    oModel.read(`/Players/${oPlayer.player_ID}`, {
                      success: (oPlayerData) => {
                        aPlayers.push(oPlayerData);
                      },
                    });
                  });
                  aTeam2Data.players = aPlayers;
                  oTeam2Details.setData(aTeam2Data);
                },
              });
            },
            error: (oErr) => {
              MessageBox.error("{i18n>Something went wrong}");
              console.error(oErr.message);
            },
          });
          resolve();
        });

        oPromise.then(() => {
          console.log(oTeam1Details);
          console.log(oTeam2Details);
          // oMatchesModel.setData(aTeams);
          // oView.setModel(oMatchesModel, "MatchesModel");
        });
      },
    });
  }
);
