sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"../model/Formatter",
		"sap/ui/core/Theming",
	],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, JSONModel, MessageBox, Formatter, Theming) {
		"use strict";

		return Controller.extend("frontendapp.controller.Home", {
			formatter: Formatter,
			onInit: function () {
				this.refreshView();
			},

			getI18nText: function (sText, aArguments) {
				return this.getOwnerComponent()
					.getModel("i18n")
					.getResourceBundle()
					.getText(sText, aArguments);
			},

			onPressTeams: function () {
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("TeamsList");
			},

			onPressPlayers: function () {
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("PlayersList");
			},

			onPressMatchHistory: function () {
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("MatchHistory");
			},

			onPressAddMatch: function () {
				const oView = this.getView();

				if (!this.AddNewMatchDialog) {
					this.AddNewMatchDialog = this.loadFragment({
						name: "frontendapp.view.fragment.AddNewMatchDialog",
					});
				}
				this.AddNewMatchDialog.then(function (oDialog) {
					oView.byId("matchDate").setMinDate(new Date());
					oDialog.open();
				});
			},
			addMatch: function () {
				const oView = this.getView();
				const oModel = oView.getModel();

				const sMatchID = globalThis.crypto.randomUUID();
				const sMatchPlace = oView.byId("matchPlace").getValue();
				const sMatchDate = oView.byId("matchDate").getValue();
				const sHomeTeamID = oView.byId("homeTeam").getSelectedKey();
				const sGuestTeamID = oView.byId("guestTeam").getSelectedKey();

				if (sHomeTeamID === "") {
					MessageBox.error(this.getI18nText("chooseHomeTeam"));
					return;
				}
				if (sGuestTeamID === "") {
					MessageBox.error(this.getI18nText("chooseGuestTeam"));
					return;
				}

				if (sHomeTeamID === sGuestTeamID) {
					MessageBox.error(this.getI18nText("cantHaveTheSameTeam"));
					return;
				}
				if (sMatchDate === "") {
					MessageBox.error(this.getI18nText("pickDate"));
					return;
				}
				if (sMatchPlace === "") {
					MessageBox.error(this.getI18nText("pickPlace"));
					return;
				}

				const sHomeTeamName = oView
					.byId("homeTeam")
					.getItemByKey(sHomeTeamID)
					.getProperty("text");
				const sGuestTeamName = oView
					.byId("guestTeam")
					.getItemByKey(sGuestTeamID)
					.getProperty("text");

				const aTeams = [
					{
						up__ID: sMatchID,
						team_ID: sHomeTeamID,
					},
					{
						up__ID: sMatchID,
						team_ID: sGuestTeamID,
					},
				];

				const oPayload = {
					ID: sMatchID,
					teams: aTeams,
					homeTeamID: sHomeTeamID,
					place: sMatchPlace,
					date: sMatchDate,
				};

				oModel.create("/Matches", oPayload, {
					method: "POST",
					success: () => {
						this.refreshView();
						MessageBox.success(
							this.getI18nText("addedMatch", [
								sHomeTeamName,
								sGuestTeamName,
								sMatchPlace,
								sMatchDate,
							])
						);
					},
					error: (oErr) => {
						MessageBox.error(this.getI18nText("errorMessage"));
						console.error(oErr.message);
					},
				});
				this.byId("addNewMatchDialog").close();
				this.clearFields();
			},

			onPressDeleteMatch: function (oEvent) {
				const oMatch = oEvent.getSource().getBindingContext("MatchesModel");
				const oHomeTeam = oMatch.getProperty("homeTeam");
				const oGuestTeam = oMatch.getProperty("guestTeam");

				MessageBox.confirm(
					this.getI18nText("confirmMatchDelete", [oHomeTeam.name, oGuestTeam.name]),
					{
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								this.deleteMatch(oMatch.getProperty("ID"));
							}
						}.bind(this),
					}
				);
			},

			deleteMatch: function (sMatchID) {
				const oModel = new sap.ui.model.odata.v2.ODataModel("/v2/football/");

				oModel.remove(`/Matches(${sMatchID})`, {
					success: () => {
						this.refreshView();
					},
					error: (oErr) => {
						MessageBox.error(this.getI18nText("errorMessage"));
						console.error(oErr.message);
					},
				});
			},

			onPressFinishMatch: function (oEvent) {
				const oView = this.getView();
				const oMatch = oEvent.getSource().getBindingContext("MatchesModel");

				const oMatchModel = new JSONModel({
					ID: oMatch.getProperty("ID"),
					homeTeam: oMatch.getProperty("homeTeam/name"),
					homeTeamID: oMatch.getProperty("homeTeam/ID"),
					guestTeam: oMatch.getProperty("guestTeam/name"),
					guestTeamID: oMatch.getProperty("guestTeam/ID"),
					place: oMatch.getProperty("place"),
					date: oMatch.getProperty("date"),
				});

				if (!this.FinishMatchDialog) {
					this.FinishMatchDialog = this.loadFragment({
						name: "frontendapp.view.fragment.FinishMatchDialog",
					});
				}
				this.FinishMatchDialog.then(function (oDialog) {
					oView.setModel(oMatchModel, "matchModel");
					oDialog.open();
				});
			},
			submitMatch: function () {
				const oView = this.getView();
				const oModel = new sap.ui.model.odata.v2.ODataModel("/v2/football/");
				const oData = oView.getModel("matchModel").getData();

				const sHomeTeamScore = oView.byId("homeTeamScore").getValue();
				const sGuestTeamScore = oView.byId("guestTeamScore").getValue();
				const sHomeTeamID = oData.homeTeamID;
				const sGuestTeamID = oData.guestTeamID;

				const oPayload = {
					homeTeam: oData.homeTeam,
					guestTeam: oData.guestTeam,
					score: `${sHomeTeamScore}:${sGuestTeamScore}`,
					place: oData.place,
					date: oData.date,
				};

				oModel.create(`/FinishedMatches`, oPayload, {
					success: () => {
						oView.byId("finishMatchDialog").close();
						MessageBox.success(this.getI18nText("scoreSubmitted"));
						this.deleteMatch(oData.ID);
						this.updateTeamStats(
							sHomeTeamID,
							sGuestTeamID,
							sHomeTeamScore,
							sGuestTeamScore
						);
						this.clearFields();
					},
					error: (oErr) => {
						MessageBox.error(this.getI18nText("errorMessage"));
						console.error(oErr.message);
					},
				});
			},

			updateTeamStats: function (sHomeTeamID, sGuestTeamID, sHomeTeamScore, sGuestTeamScore) {
				const oView = this.getView();
				const oModel = oView.getModel();

				let oHomeData;
				let oGuestData;

				const oHomePromise = new Promise((resolve, reject) => {
					oModel.read(`/Teams(${sHomeTeamID})`, {
						urlParameters: {
							$select: "scored,wins,losses,conceded,draws,logo",
						},
						success: (oData) => {
							oHomeData = oData;
							resolve();
						},
						error: (oErr) => {
							MessageBox.error(this.getI18nText("errorMessage"));
							console.error(oErr.message);
							reject();
						},
					});
				});

				const oGuestPromise = new Promise((resolve, reject) => {
					oModel.read(`/Teams(${sGuestTeamID})`, {
						urlParameters: {
							$select: "scored,wins,losses,conceded,draws,logo",
						},
						success: (oData) => {
							oGuestData = oData;
							resolve();
						},
						error: (oErr) => {
							MessageBox.error(this.getI18nText("errorMessage"));
							console.error(oErr.message);
							reject();
						},
					});
				});

				Promise.all([oHomePromise, oGuestPromise]).then(() => {
					oHomeData.scored += sHomeTeamScore;
					oHomeData.conceded += sGuestTeamScore;

					oGuestData.scored += sGuestTeamScore;
					oGuestData.conceded += sHomeTeamScore;

					if (sHomeTeamScore > sGuestTeamScore) {
						oHomeData.wins += 1;
						oGuestData.losses += 1;
					} else if (sHomeTeamScore < sGuestTeamScore) {
						oGuestData.wins += 1;
						oHomeData.losses += 1;
					} else {
						oHomeData.draws += 1;
						oGuestData.draws += 1;
					}

					oModel.update(`/Teams(${sHomeTeamID})`, oHomeData, {
						error: (oErr) => {
							MessageBox.error(this.getI18nText("errorMessage"));
							console.error(oErr.message);
						},
					});
					oModel.update(`/Teams(${sGuestTeamID})`, oGuestData, {
						error: (oErr) => {
							MessageBox.error(this.getI18nText("errorMessage"));
							console.error(oErr.message);
						},
					});
					oView.byId("teamRankingTable").getModel().refresh();
				});
			},

			onPressMatch: function (oEvent) {
				const sMatchID = oEvent
					.getSource()
					.getBindingContext("MatchesModel")
					.getObject().ID;
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("MatchDetails", {
					MatchID: sMatchID,
				});
			},

			onPressCancel: function () {
				if (this.byId("addNewMatchDialog")) {
					this.byId("addNewMatchDialog").close();
				}
				if (this.byId("finishMatchDialog")) {
					this.byId("finishMatchDialog").close();
				}
				this.clearFields();
			},

			clearFields: function () {
				const oView = this.getView();
				if (oView.byId("homeTeam")) {
					oView.byId("homeTeam").setSelectedKey();
				}
				if (oView.byId("guestTeam")) {
					oView.byId("guestTeam").setSelectedKey();
				}
				if (oView.byId("matchDate")) {
					oView.byId("matchDate").setValue();
				}
				if (oView.byId("matchPlace")) {
					oView.byId("matchPlace").setValue();
				}
				if (oView.byId("matchScore")) {
					oView.byId("matchScore").setValue();
				}
				if (oView.byId("homeTeamScore")) {
					oView.byId("homeTeamScore").setValue();
				}
				if (oView.byId("guestTeamScore")) {
					oView.byId("guestTeamScore").setValue();
				}
			},

			changeTheme: function () {
				const oButton = this.getView().byId("changeThemeButton");
				const sTheme = Theming.getTheme();

				if (sTheme === "sap_horizon") {
					oButton.setIcon("sap-icon://light-mode");
					Theming.setTheme("sap_fiori_3_dark");
				} else {
					oButton.setIcon("sap-icon://dark-mode");
					Theming.setTheme("sap_horizon");
				}
			},

			refreshView: function () {
				const oView = this.getView();
				const oModel = new sap.ui.model.odata.v2.ODataModel("/v2/football/");
				const oMatchesModel = new JSONModel();
				const aTeams = [];

				const oPromise = new Promise((resolve, reject) => {
					oModel.read("/Matches", {
						urlParameters: {
							$expand: "teams/team",
						},
						success: (oData) => {
							oData.results.forEach((oMatchData) => {
								const oTeam1 = oMatchData.teams.results[0].team;
								const oTeam2 = oMatchData.teams.results[1].team;
								aTeams.push({
									ID: oMatchData.ID,
									homeTeam: oMatchData.homeTeamID === oTeam1.ID ? oTeam1 : oTeam2,
									guestTeam:
										oMatchData.homeTeamID !== oTeam1.ID ? oTeam1 : oTeam2,
									date: oMatchData.date,
									place: oMatchData.place,
								});
							});
							resolve();
						},
						error: (oErr) => {
							MessageBox.error(this.getI18nText("errorMessage"));
							console.error(oErr.message);
							reject();
						},
					});
				});

				oPromise.then(() => {
					oMatchesModel.setData(aTeams);
					oView.setModel(oMatchesModel, "MatchesModel");
				});
			},
		});
	}
);
