sap.ui.define(
	["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"],
	function (BaseController, JSONModel, MessageBox) {
		"use strict";

		return BaseController.extend("frontendapp.controller.MatchDetails", {
			onInit: function () {
				const oComponent = this.getOwnerComponent();
				const oHomeTeamDetails = new JSONModel();
				const oGuestTeamDetails = new JSONModel();

				oComponent.setModel(oHomeTeamDetails, "homeTeamDetailsModel");
				oComponent.setModel(oGuestTeamDetails, "guestTeamDetailsModel");
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

				const oPromise = new Promise((resolve) => {
					oModel.read(`/Matches/${oEvent.getParameter("arguments").MatchID}`, {
						urlParameters: {
							$expand: "teams",
						},
						success: (oData) => {
							const aTeams = oData.teams.results;
							let bHomeTeam = true;
							aTeams.forEach((oTeam) => {
								oModel.read(`/Teams/${oTeam.team_ID}`, {
									urlParameters: {
										$expand: "players",
									},
									success: (oTeamData) => {
										const aTeamData = {};
										aTeamData.name = oTeamData.name;
										const aPlayers = [];

										oTeamData.players.results.forEach((oPlayer) => {
											oModel.read(`/Players/${oPlayer.player_ID}`, {
												success: (oPlayerData) => {
													aPlayers.push(oPlayerData);
												},
											});
										});
										aTeamData.players = aPlayers;
										bHomeTeam
											? oHomeTeamDetails.setData(aTeamData)
											: oGuestTeamDetails.setData(aTeamData);
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
					console.log(oHomeTeamDetails);
					console.log(oGuestTeamDetails);
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
