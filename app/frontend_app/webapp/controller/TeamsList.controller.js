sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/f/library",
		"../model/Formatter",
	],
	function (
		BaseController,
		JSONModel,
		MessageBox,
		Filter,
		FilterOperator,
		FioriLibrary,
		Formatter
	) {
		"use strict";

		return BaseController.extend("frontendapp.controller.TeamsList", {
			formatter: Formatter,
			onInit: function () {
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("TeamsList").attachPatternMatched(this._onPatternMatched, this);
			},

			_onPatternMatched: function () {
				this.handleClose();
			},
			onPressAddTeam: function () {
				const oView = this.getView();
				const oModel = oView.getModel();

				if (!this.createNewTeamDialog) {
					this.createNewTeamDialog = this.loadFragment({
						name: "frontendapp.view.fragment.AddNewTeamDialog",
					});
				}
				this.createNewTeamDialog.then(function (oDialog) {
					oDialog.open();
					const aPlayers = [];
					const oPromise = new Promise((resolve, reject) => {
						oModel.read(`/Players`, {
							urlParameters: {
								$expand: "team",
							},
							success: (oData) => {
								oData.results.forEach((oPlayer) => {
									if (!oPlayer.team) {
										aPlayers.push(oPlayer);
									}
									resolve();
								});
							},
							error: (oErr) => {
								MessageBox.error("{i18n>Something went wrong}");
								console.error(oErr.message);
								reject();
							},
						});
					});
					oPromise.then(() => {
						const oAvailablePlayersModel = new JSONModel(aPlayers);
						oDialog.setModel(oAvailablePlayersModel, "AvailablePlayers");
					});
				});
			},

			addTeam: function () {
				const oView = this.getView();
				const sTeamID = globalThis.crypto.randomUUID();
				const oModel = this.getView().getModel();
				const sTeamName = oView.byId("teamName").getValue();
				const sLogo = oView.byId("badgeLink").getValue();
				const aSelectedPlayers = oView.byId("selectedPlayers").getSelectedKeys();

				if (sTeamName === "") {
					MessageBox.error("Enter Team Name!");
					return;
				}

				if (aSelectedPlayers.length === 0) {
					MessageBox.error("Select Players!");
					return;
				}

				const aPlayers = [];
				aSelectedPlayers.forEach((sPlayerID) => {
					aPlayers.push({
						up__ID: sTeamID,
						player_ID: sPlayerID,
					});
				});
				const oPayload = {
					ID: sTeamID,
					name: sTeamName,
					logo: sLogo,
					players: aPlayers,
				};

				oModel.create("/Teams", oPayload, {
					method: "POST",
					success: () => {
						this.refreshView();
						MessageBox.success(`Team ${sTeamName} added`);
					},
					error: (oErr) => {
						MessageBox.error("Something went wrong");
						console.error(oErr.message);
					},
				});
				this.byId("addNewTeamDialog").close();
				this.clearFields();
			},

			onPressUpdateTeam: function (oEvent) {
				const oView = this.getView();
				const oModel = oView.getModel();
				const oTeam = oEvent.getSource().getBindingContext().getObject();

				const oTeamModel = new JSONModel(oTeam);
				const aSelectedPlayers = [];
				const aPlayers = [];

				if (!this.updateTeamDialog) {
					this.updateTeamDialog = this.loadFragment({
						name: "frontendapp.view.fragment.UpdateTeamDialog",
					});
				}
				this.updateTeamDialog.then(function (oDialog) {
					oView.setModel(oTeamModel, "teamModel");
					oDialog.open();

					const oPromise = new Promise((resolve, reject) => {
						oModel.read(`/Players`, {
							urlParameters: {
								$expand: "team",
							},
							success: (oData) => {
								oData.results.forEach((oPlayer) => {
									if (!oPlayer.team) {
										aPlayers.push(oPlayer);
									} else if (oPlayer.team.up__ID === oTeam.ID) {
										aSelectedPlayers.push(oPlayer.ID);
										aPlayers.push(oPlayer);
									}
								});
								resolve();
							},
							error: (oErr) => {
								MessageBox.error("{i18n>Something went wrong}");
								console.error(oErr.message);
								reject();
							},
						});
					});

					oPromise.then(() => {
						const oAvailablePlayersModel = new JSONModel(aPlayers);
						oDialog.setModel(oAvailablePlayersModel, "AvailablePlayers");
						oView.byId("selectedPlayersU").setSelectedKeys(aSelectedPlayers);
					});
				});
			},

			updateTeam: function () {
				const oView = this.getView();
				const oModel = oView.getModel();
				const oTeamModel = oView.getModel("teamModel");

				const sTeamID = oTeamModel.getData().ID;
				const sTeamName = oView.byId("teamNameU").getValue();
				const sLogo = oView.byId("badgeLinkU").getValue();
				const aSelectedPlayers = oView.byId("selectedPlayersU").getSelectedKeys();

				if (sTeamName === "") {
					MessageBox.error("Enter Team Name!");
					return;
				}

				if (aSelectedPlayers.length === 0) {
					MessageBox.error("Select Players!");
					return;
				}

				const oPayload = {
					name: sTeamName,
					logo: sLogo,
					players: [],
					matches: [],
				};

				oModel.update(`/Teams(${sTeamID})`, oPayload, {
					success: () => {
						aSelectedPlayers.forEach((sPlayerID) => {
							const oPlayerInTeamPayload = {
								up__ID: sTeamID,
								player_ID: sPlayerID,
							};
							oModel.create(`/Teams_players`, oPlayerInTeamPayload, {
								error: (oErr) => {
									MessageBox.error("Something went wrong");
									console.error(oErr.message);
								},
							});
						});
						this.refreshView();
						MessageBox.success(`Team ${sTeamName} updated`);
					},
					error: (oErr) => {
						MessageBox.error("Something went wrong");
						console.error(oErr.message);
					},
				});
				this.byId("updateTeamDialog").close();
			},

			onPressDeleteTeam: function (oEvent) {
				const oTeam = oEvent.getSource().getBindingContext().getObject();

				MessageBox.confirm(`Are you sure you want to delete ${oTeam.name}?`, {
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							this.deleteTeam(oTeam.ID);
						}
					}.bind(this),
				});
			},

			deleteTeam: function (sTeamID) {
				const oView = this.getView();
				const oModel = oView.getModel();
				let bTeamInMatch = false;

				const oPromise = new Promise((resolve, reject) => {
					oModel.read(`/Matches_teams`, {
						success: (oData) => {
							oData.results.forEach((oMatchTeamLink) => {
								if (oMatchTeamLink.team_ID === sTeamID) {
									bTeamInMatch = true;
									resolve();
									return;
								}
							});
							resolve();
						},
						error: (oErr) => {
							MessageBox.error("Something went wrong");
							console.error(oErr.message);
							reject();
						},
					});
				});

				oPromise.then(() => {
					if (!bTeamInMatch) {
						oModel.remove(`/Teams(${sTeamID})`, {
							error: (oErr) => {
								MessageBox.error("Something went wrong");
								console.error(oErr.message);
							},
						});
						this.refreshView();
					} else {
						MessageBox.error("Team is in a match!");
					}
				});
			},

			onSearch: function (oEvent) {
				let oTableSearchState = [],
					sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					oTableSearchState = [new Filter("name", FilterOperator.Contains, sQuery)];
				}

				this.oView
					.byId("teamsTable")
					.getBinding("items")
					.filter(oTableSearchState, "Application");
			},

			onPressTeam: function (oEvent) {
				const oView = this.getView();
				const oModel = oView.getModel();
				const oTeam = oEvent.getSource().getBindingContext().getObject();
				const aMatches = [];
				let aPlayers;
				let sOldTeamID;

				if (oView.getModel("teamModel")) {
					sOldTeamID = oView.getModel("teamModel").getData().ID;
				}

				const oPlayersPromise = new Promise((resolve, reject) => {
					oModel.read(`/Teams(${oTeam.ID})`, {
						urlParameters: {
							$expand: "players/player/position",
						},
						success: (oData) => {
							aPlayers = oData.players.results;
							resolve();
						},
						error: (oErr) => {
							MessageBox.error("Something went wrong");
							console.error(oErr.message);
							reject();
						},
					});
				});

				const oMatchesPromise = new Promise((resolve, reject) => {
					oModel.read(`/Matches_teams`, {
						urlParameters: {
							$expand: "up_/teams/team",
						},
						success: (oMatches) => {
							oMatches.results.forEach((oMatch) => {
								if (oMatch.team_ID === oTeam.ID) {
									const sHomeTeamID = oMatch.up_.homeTeamID;
									const oTeam1 = oMatch.up_.teams.results[0].team;
									const oTeam2 = oMatch.up_.teams.results[1].team;
									const oHomeTeam = oTeam1.ID === sHomeTeamID ? oTeam1 : oTeam2;
									const oGuestTeam = oTeam1.ID !== sHomeTeamID ? oTeam1 : oTeam2;
									aMatches.push({
										homeTeam: oHomeTeam.name,
										homeLogo: oHomeTeam.logo,
										guestTeam: oGuestTeam.name,
										guestLogo: oGuestTeam.logo,
										date: oMatch.up_.date,
									});
								}
							});
							resolve();
						},
						error: (oErr) => {
							MessageBox.error("Something went wrong");
							console.error(oErr.message);
							reject();
						},
					});
				});

				Promise.all([oPlayersPromise, oMatchesPromise]).then(() => {
					const oFCL = oView.getParent().getParent();
					oTeam.allMatches = oTeam.wins + oTeam.losses + oTeam.draws;
					oFCL.setModel(new JSONModel(oTeam), "teamModel");
					oFCL.setModel(new JSONModel(aPlayers), "teamPlayersModel");
					oFCL.setModel(new JSONModel(aMatches), "matchesModel");

					if (oFCL.getLayout() === FioriLibrary.LayoutType.OneColumn) {
						oFCL.setLayout(FioriLibrary.LayoutType.TwoColumnsMidExpanded);
					} else if (sOldTeamID === oTeam.ID) {
						oFCL.setLayout(FioriLibrary.LayoutType.OneColumn);
					}
				});
			},

			handleClose: function () {
				const oView = this.getView();
				const oFCL = oView.getParent().getParent();
				try {
					oFCL.setLayout(FioriLibrary.LayoutType.OneColumn);
				} catch (oErr) {
					return;
				}
			},

			refreshView: function () {
				this.getView().byId("teamsTable").getBinding("items").refresh();
			},

			clearFields: function () {
				const oView = this.getView();
				if (oView.byId("teamName")) {
					oView.byId("teamName").setValue();
				}
				if (oView.byId("badgeLink")) {
					oView.byId("badgeLink").setValue();
				}
				if (oView.byId("selectedPlayers")) {
					oView.byId("selectedPlayers").removeAllSelectedItems();
				}
			},

			onPressCancel: function () {
				if (this.byId("addNewTeamDialog")) this.byId("addNewTeamDialog").close();
				if (this.byId("updateTeamDialog")) this.byId("updateTeamDialog").close();
				this.clearFields();
			},

			onNavButton: function () {
				window.history.go(-1);
			},
		});
	}
);
