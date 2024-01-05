sap.ui.define(
	[
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox',
	],
	function (BaseController, JSONModel, MessageBox) {
		'use strict';

		return BaseController.extend('frontendapp.controller.TeamsList', {
			onInit: function () {},
			onPressAddTeam: function () {
				if (!this.createNewTeamDialog) {
					this.createNewTeamDialog = this.loadFragment({
						name: 'frontendapp.view.fragment.AddNewTeamDialog',
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
				const sTeamName = oView.byId('teamName').getValue();
				const aSelectedPlayers = oView
					.byId('selectedPlayers')
					.getSelectedKeys();

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
					players: aPlayers,
				};

				oModel.create('/Teams', oPayload, {
					method: 'POST',
					success: (oRes) => {
						this.refreshView();
						MessageBox.success(`Team ${sTeamName} added`);
					},
					error: (oErr) => {
						MessageBox.error('Something went wrong');
						console.error(oErr.message);
					},
				});
				this.byId('addNewTeamDialog').close();
				this.clearFields();
			},

			onUpdateTeamPress: function (oEvent) {
				const oView = this.getView();
				const oModel = oView.getModel();
				const oTeam = oEvent
					.getSource()
					.getBindingContext()
					.getObject();

				const oTeamModel = new JSONModel(oTeam);
				const aSelectedPlayers = [];

				if (!this.updateTeamDialog) {
					this.updateTeamDialog = this.loadFragment({
						name: 'frontendapp.view.fragment.UpdateTeamDialog',
					});
				}
				this.updateTeamDialog.then(function (oDialog) {
					oView.setModel(oTeamModel, 'teamModel');
					oDialog.open();

					oModel.read(`/Teams(${oTeam.ID})`, {
						urlParameters: {
							$expand: 'players',
						},
						success: (oData) => {
							const aPlayersData = oData.players.results;
							aPlayersData.forEach((oPlayer) => {
								aSelectedPlayers.push(oPlayer.player_ID);
							});
							oView
								.byId('selectedPlayersU')
								.setSelectedKeys(aSelectedPlayers);
						},
						error: (oErr) => {
							MessageBox.error('{i18n>Something went wrong}');
							console.error(oErr.message);
						},
					});
				});
			},

			updateTeam: function (oDialog) {
				const oView = this.getView();
				const oModel = oView.getModel();
				const oTeamModel = oView.getModel('teamModel');

				const sTeamID = oTeamModel.getData().ID;
				const sTeamName = oView.byId('teamNameU').getValue();
				const sLogo = oView.byId('badgeU').getValue();
				const aSelectedPlayers = oView
					.byId('selectedPlayersU')
					.getSelectedKeys();

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
							oModel.create(
								`/Teams_players`,
								oPlayerInTeamPayload,
								{
									error: (oErr) => {
										MessageBox.error(
											'Something went wrong'
										);
										console.error(oErr.message);
									},
								}
							);
						});
						this.refreshView();
						MessageBox.success(`Team ${sTeamName} updated`);
					},
					error: (oErr) => {
						MessageBox.error('Something went wrong');
						console.error(oErr.message);
					},
				});
				this.byId('updateTeamDialog').close();
			},

			onTeamPress: function () {
				console.log('XD ON TEAMPRESS');
			},

			refreshView: function () {
				this.getView().byId('teamsTable').getBinding('items').refresh();
			},

			clearFields: function () {
				this.getView().byId('teamName').setValue('');
				this.getView().byId('badge').setValue('');
				this.getView().byId('selectedPlayers').removeAllSelectedItems();
			},

			onPressCancel: function () {
				if (this.byId('addNewTeamDialog'))
					this.byId('addNewTeamDialog').close();
				if (this.byId('updateTeamDialog'))
					this.byId('updateTeamDialog').close();
			},

			onNavButton: function () {
				window.history.go(-1);
			},
		});
	}
);
