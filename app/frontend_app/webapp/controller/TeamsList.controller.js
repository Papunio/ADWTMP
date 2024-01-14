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
			onInit: function () {},
			onPressAddTeam: function () {
				if (!this.createNewTeamDialog) {
					this.createNewTeamDialog = this.loadFragment({
						name: "frontendapp.view.fragment.AddNewTeamDialog",
					});
				}
				this.createNewTeamDialog.then(function (oDialog) {
					oDialog.open();
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
					wins: 0,
					draws: 0,
					losses: 0,
					scored: 0,
					conceded: 0,
				};

				oModel.create("/Teams", oPayload, {
					method: "POST",
					success: (oRes) => {
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

			onUpdateTeamPress: function (oEvent) {
				const oView = this.getView();
				const oModel = oView.getModel();
				const oTeam = oEvent.getSource().getBindingContext().getObject();

				const oTeamModel = new JSONModel(oTeam);
				const aSelectedPlayers = [];

				if (!this.updateTeamDialog) {
					this.updateTeamDialog = this.loadFragment({
						name: "frontendapp.view.fragment.UpdateTeamDialog",
					});
				}
				this.updateTeamDialog.then(function (oDialog) {
					oView.setModel(oTeamModel, "teamModel");
					oDialog.open();

					oModel.read(`/Teams(${oTeam.ID})`, {
						urlParameters: {
							$expand: "players",
						},
						success: (oData) => {
							const aPlayersData = oData.players.results;
							aPlayersData.forEach((oPlayer) => {
								aSelectedPlayers.push(oPlayer.player_ID);
							});
							oView.byId("selectedPlayersU").setSelectedKeys(aSelectedPlayers);
						},
						error: (oErr) => {
							MessageBox.error("{i18n>Something went wrong}");
							console.error(oErr.message);
						},
					});
				});
			},

			updateTeam: function (oDialog) {
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
					success: (oData) => {
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

			onDeleteTeamPress: function (oEvent) {
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

				const oPromise = new Promise((resolve) => {
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

			onTeamPress: function (oEvent) {
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
							$expand: "players/player",
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
							const aScheludedMatches = oMatches.results.filter(
								// Czy od razu tutaj tego foreacha nizej
								(oMatch) => oMatch.team_ID === oTeam.ID
							);
							aScheludedMatches.forEach((oMatch) => {
								aMatches.push({
									homeTeam: oMatch.up_.teams.results[0].team.name,
									homeLogo: oMatch.up_.teams.results[0].team.logo,
									guestTeam: oMatch.up_.teams.results[1].team.name,
									guestLogo: oMatch.up_.teams.results[1].team.logo,
									date: oMatch.up_.date,
								});
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

				// Tutaj bedzie promise all
				Promise.all([oPlayersPromise, oMatchesPromise]).then(() => {
					const oFCL = oView.getParent().getParent();
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
				oFCL.setLayout(FioriLibrary.LayoutType.OneColumn);
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
