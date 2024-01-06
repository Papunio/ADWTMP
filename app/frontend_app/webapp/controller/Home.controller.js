sap.ui.define(
	[
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox',
		'sap/ui/core/format/DateFormat',
		'../model/Formatter',
	],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, JSONModel, MessageBox, DateFormat, Formatter) {
		'use strict';

		return Controller.extend('frontendapp.controller.Home', {
			formatter: Formatter,
			onInit: function () {
				this.refreshView();
			},

			onPressTeams: function () {
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo('TeamsList');
			},

			onPressPlayers: function () {
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo('PlayersList');
			},

			onPressMatchHistory: function () {
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo('MatchHistory');
			},

			onPressAddMatch: function () {
				const oView = this.getView();
				if (!this.AddNewMatchDialog) {
					this.AddNewMatchDialog = this.loadFragment({
						name: 'frontendapp.view.fragment.AddNewMatchDialog',
					});
				}
				this.AddNewMatchDialog.then(function (oDialog) {
					oView.byId('matchDate').setMinDate(new Date());
					oDialog.open();
				});
			},
			addMatch: function () {
				const oView = this.getView();
				const oModel = this.getView().getModel();

				const sMatchID = globalThis.crypto.randomUUID();
				const sMatchPlace = oView.byId('matchPlace').getValue();
				const sMatchDate = oView.byId('matchDate').getValue();
				const sHomeTeamID = oView.byId('homeTeam').getSelectedKey();
				const sGuestTeamID = oView.byId('guestTeam').getSelectedKey();

				if (sHomeTeamID === '') {
					MessageBox.error('Choose home team!');
					return;
				}
				if (sGuestTeamID === '') {
					MessageBox.error('Choose guest team!');
					return;
				}
				if (sMatchDate === '') {
					MessageBox.error('Pick date!');
					return;
				}
				if (sMatchPlace === '') {
					MessageBox.error('Pick match place!');
					return;
				}

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
					place: sMatchPlace,
					date: sMatchDate,
				};
				oModel.create('/Matches', oPayload, {
					method: 'POST',
					success: (oRes) => {
						this.refreshView();
						MessageBox.success(`Match between XD added`); // --------
					},
					error: (oErr) => {
						MessageBox.error('Something went wrong');
						console.error(oErr.message);
					},
				});
				this.byId('addNewMatchDialog').close();
				this.clearFields();
			},

			onDeleteMatchPress: function (oEvent) {
				const oMatch = oEvent
					.getSource()
					.getBindingContext('MatchesModel');
				const oHomeTeam = oMatch.getProperty('team1');
				const oGuestTeam = oMatch.getProperty('team2');

				MessageBox.confirm(
					`Are you sure you want to delete match between ${oHomeTeam.name} and ${oGuestTeam.name}?`,
					{
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								this.deleteMatch(oMatch.getProperty('ID'));
							}
						}.bind(this),
					}
				);
			},

			deleteMatch: function (sMatchID) {
				const oModel = new sap.ui.model.odata.v2.ODataModel(
					'/v2/football/'
				);

				oModel.remove(`/Matches(${sMatchID})`, {
					success: () => {
						this.refreshView();
					},
					error: (oErr) => {
						MessageBox.error('Something went wrong');
						console.error(oErr.message);
					},
				});
			},

			onFinishMatchPress: function (oEvent) {
				const oView = this.getView();
				const oMatch = oEvent
					.getSource()
					.getBindingContext('MatchesModel');

				const oMatchModel = new JSONModel({
					ID: oMatch.getProperty('ID'),
					homeTeam: oMatch.getProperty('team1/name'),
					guestTeam: oMatch.getProperty('team2/name'),
					place: oMatch.getProperty('place'),
				});

				if (!this.FinishMatchDialog) {
					this.FinishMatchDialog = this.loadFragment({
						name: 'frontendapp.view.fragment.FinishMatchDialog',
					});
				}
				this.FinishMatchDialog.then(function (oDialog) {
					oView.setModel(oMatchModel, "matchModel");
					oDialog.open();
				});
			},
			submitMatch: function () {
				const oView = this.getView();
				const oModel = new sap.ui.model.odata.v2.ODataModel(
					'/v2/football/'
				);
				const oData = oView.getModel("matchModel").getData();

				const sHomeTeamScore = oView.byId('homeTeamScore').getValue();
				const sGuestTeamScore = oView.byId('guestTeamScore').getValue();

				const oPayload = {
					homeTeam: oData.homeTeam,
					guestTeam: oData.guestTeam,
					score: `${sHomeTeamScore}:${sGuestTeamScore}`,
					place: oData.place,
				};

				oModel.create(`/FinishedMatches`, oPayload, {
					success: (oRes) => {
						oView.byId('finishMatchDialog').close();
						this.deleteMatch(oData.ID);
						this.clearFields();
					},
					error: (oErr) => {
						MessageBox.error('Something went wrong');
						console.error(oErr.message);
					},
				});
			},

			onMatchPress: function (oEvent) {
				const sMatchID = oEvent
					.getSource()
					.getBindingContext('MatchesModel')
					.getObject().ID;
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo('MatchDetails', {
					MatchID: sMatchID,
				});
			},

			onPressCancel: function () {
				if (this.byId('addNewMatchDialog')) {
					this.byId('addNewMatchDialog').close();
				}
				if (this.byId('finishMatchDialog')) {
					this.byId('finishMatchDialog').close();
				}
				this.clearFields();
			},

			clearFields: function () {
				const oView = this.getView();
				if (oView.byId('homeTeam')) {
					oView.byId('homeTeam').setSelectedKey();
				}
				if (oView.byId('guestTeam')) {
					oView.byId('guestTeam').setSelectedKey();
				}
				if (oView.byId('matchDate')) {
					oView.byId('matchDate').setValue();
				}
				if (oView.byId('matchPlace')) {
					oView.byId('matchPlace').setValue();
				}
				if (oView.byId('matchScore')) {
					oView.byId('matchScore').setValue();
				}
				if (oView.byId('homeTeamScore')) {
					oView.byId('homeTeamScore').setValue();
				}
				if (oView.byId('guestTeamScore')) {
					oView.byId('guestTeamScore').setValue();
				}
			},

			refreshView: function () {
				const oView = this.getView();
				const oModel = new sap.ui.model.odata.v2.ODataModel(
					'/v2/football/'
				);
				const oMatchesModel = new JSONModel();
				const aTeams = [];

				const oPromise = new Promise((resolve) => {
					oModel.read('/Matches', {
						urlParameters: {
							$expand: 'teams/team',
						},
						success: (oData) => {
							oData.results.forEach((oMatchData) => {
								const oTeam1 = oMatchData.teams.results[0].team;
								const oTeam2 = oMatchData.teams.results[1].team;
								aTeams.push({
									ID: oMatchData.ID,
									index: aTeams.length + 1,
									team1: oTeam1,
									team2: oTeam2,
									date: oMatchData.date,
									place: oMatchData.place,
								});
							});
							resolve();
						},
						error: (oErr) => {
							MessageBox.error('{i18n>Something went wrong}');
							console.error(oErr.message);
						},
					});
				});

				oPromise.then(() => {
					oMatchesModel.setData(aTeams);
					oView.setModel(oMatchesModel, 'MatchesModel');
				});
			},
		});
	}
);
