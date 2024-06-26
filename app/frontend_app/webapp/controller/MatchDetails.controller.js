sap.ui.define(
	["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"],
	function (BaseController, JSONModel, MessageBox) {
		"use strict";

		return BaseController.extend("frontendapp.controller.MatchDetails", {
			onInit: function () {
				const oComponent = this.getOwnerComponent();
				const oHomeTeamDetails = new JSONModel();
				const oGuestTeamDetails = new JSONModel();
				const oHomePlayers = new JSONModel();
				const oGuestPlayers = new JSONModel();

				oComponent.setModel(oHomeTeamDetails, "homeTeamDetailsModel");
				oComponent.setModel(oGuestTeamDetails, "guestTeamDetailsModel");
				oComponent.setModel(oHomePlayers, "homePlayersModel");
				oComponent.setModel(oGuestPlayers, "guestPlayersModel");
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("MatchDetails").attachPatternMatched(this._onPatternMatched, this);
			},

			_onPatternMatched: function (oEvent) {
				const oComponent = this.getOwnerComponent();
				this.getView().bindElement({
					path: `/Matches/${oEvent.getParameter("arguments").MatchID}`,
				});

				const oModel = new sap.ui.model.odata.v2.ODataModel("/v2/football");

				const oHomeTeamDetails = oComponent.getModel("homeTeamDetailsModel");
				const oGuestTeamDetails = oComponent.getModel("guestTeamDetailsModel");
				const oHomePlayers = oComponent.getModel("homePlayersModel");
				const oGuestPlayers = oComponent.getModel("guestPlayersModel");

				oModel.read(`/Matches/${oEvent.getParameter("arguments").MatchID}`, {
					urlParameters: {
						$expand: "teams",
					},
					success: (oData) => {
						const sHomeTeamID = oData.homeTeamID;
						const aTeams = oData.teams.results;
						aTeams.forEach((oTeam) => {
							oModel.read(`/Teams(${oTeam.team_ID})`, {
								urlParameters: {
									$expand: "players/player",
								},
								success: (oTeamData) => {
									if (sHomeTeamID === oTeamData.ID) {
										oHomeTeamDetails.setData(oTeamData);
										oHomePlayers.setData(oTeamData.players.results);
									} else {
										oGuestTeamDetails.setData(oTeamData);
										oGuestPlayers.setData(oTeamData.players.results);
									}
								},
							});
						});
					},
					error: (oErr) => {
						MessageBox.error(this.getI18nText("errorMessage"));
						console.error(oErr.message);
					},
				});
			},

			getI18nText: function (sText, aArguments) {
				return this.getOwnerComponent()
					.getModel("i18n")
					.getResourceBundle()
					.getText(sText, aArguments);
			},

			onNavButton: function () {
				window.history.go(-1);
			},
		});
	}
);
