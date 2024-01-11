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
				this.getView().bindElement({
					path: `/Matches/${oEvent.getParameter("arguments").MatchID}`,
				});

				const oModel = new sap.ui.model.odata.v2.ODataModel("/v2/football");

				const oHomeTeamDetails = this.getOwnerComponent().getModel("homeTeamDetailsModel");
				const oGuestTeamDetails =
					this.getOwnerComponent().getModel("guestTeamDetailsModel");
				const oHomePlayers = this.getOwnerComponent().getModel("homePlayersModel");
				const oGuestPlayers = this.getOwnerComponent().getModel("guestPlayersModel");

				const oPromise = new Promise((resolve) => {
					oModel.read(`/Matches/${oEvent.getParameter("arguments").MatchID}`, {
						urlParameters: {
							$expand: "teams",
						},
						success: (oData) => {
							const aTeams = oData.teams.results;
							let bHomeTeam = true;
							aTeams.forEach((oTeam) => {
								oModel.read(`/Teams(${oTeam.team_ID})`, {
									urlParameters: {
										$expand: "players/player",
									},
									success: (oTeamData) => {
										if (bHomeTeam) {
											oHomeTeamDetails.setData(oTeamData);
											oHomePlayers.setData(oTeamData.players.results);
										} else {
											oGuestTeamDetails.setData(oTeamData);
											oGuestPlayers.setData(oTeamData.players.results);
										}
										bHomeTeam = false;
									},
								});
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
					console.log(this.getView().getModel("homePlayersModel"));
					// console.log(oHomeTeamDetails);
					// console.log(oGuestTeamDetails);
					// oMatchesModel.setData(aTeams);
					// oView.setModel(oMatchesModel, "MatchesModel");
				});
			},

			onNavButton: function () {
				window.history.go(-1);
			},
		});
	}
);
