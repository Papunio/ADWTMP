sap.ui.define(
	[
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox',
	],
	function (BaseController, JSONModel, MessageBox) {
		'use strict';

		return BaseController.extend('frontendapp.controller.PlayersList', {
			onInit: function () {
				const oSelectPosition = [
					{
						Name: 'Attacker',
						Icon: 'sap-icon://feeder-arrow',
					},
					{
						Name: 'Midfielder',
						Icon: 'sap-icon://feeder-arrow',
					},
					{
						Name: 'Defender',
						Icon: 'sap-icon://feeder-arrow',
					},
					{
						Name: 'Goalkeeper',
						Icon: 'sap-icon://feeder-arrow',
					},
				];
				this.getView().setModel(
					new JSONModel(oSelectPosition),
					'SelectModel'
				);
			},

			onPressAddPlayer: function () {
				if (!this.createNewPlayerDialog) {
					this.createNewPlayerDialog = this.loadFragment({
						name: 'frontendapp.view.fragment.AddNewPlayerDialog',
					});
				}
				this.createNewPlayerDialog.then(function (oDialog) {
					oDialog.open();
				});
			},

			addPlayer: function () {
				const oView = this.getView();
				const oModel = oView.getModel();
				// WALIDACJA!
				const sName = oView.byId('playerName').getValue();
				const sLastName = oView.byId('playerLastName').getValue();
				const sAge = oView.byId('playerAge').getValue();
				const sPosition = oView
					.byId('playerPosition')
					.getSelectedItem()
					.getText();

				const oPayload = {
					name: sName,
					lastName: sLastName,
					position: sPosition,
					age: sAge,
				};

				oModel.create('/Players', oPayload, {
					method: 'POST',
					success: (oRes) => {
						this.refreshView();
						MessageBox.success(
							`Player ${sName} ${sLastName} added`
						);
					},
					error: (oErr) => {
						MessageBox.error('Something went wrong');
						console.error(oErr.message);
					},
				});
				this.byId('addNewPlayerDialog').close();
				this.clearFields();
			},

			onUpdatePlayerPress: function (oEvent) {
				const oView = this.getView();
				const oPlayer = oEvent
					.getSource()
					.getBindingContext()
					.getObject();

				const oPlayerModel = new JSONModel(oPlayer);

				if (!this.updatePlayerDialog) {
					this.updatePlayerDialog = this.loadFragment({
						name: 'frontendapp.view.fragment.UpdatePlayerDialog',
					});
				}
				this.updatePlayerDialog.then(function (oDialog) {
					oView.setModel(oPlayerModel, 'playerModel');
					oDialog.open();
					oView.byId('playerAgeU').setValue(oPlayer.age);
					oView
						.byId('playerPositionU')
						.setSelectedKey(oPlayer.position);
				});
			},

			updatePlayer: function () {
				const oView = this.getView();
				const oModel = oView.getModel();
				// WALIDACJA!
				const sPlayerID = oView.getModel('playerModel').getData().ID;
				const sName = oView.byId('playerNameU').getValue();
				const sLastName = oView.byId('playerLastNameU').getValue();
				const sAge = oView.byId('playerAgeU').getValue();
				const sPosition = oView
					.byId('playerPositionU')
					.getSelectedItem()
					.getText();

				const oPayload = {
					name: sName,
					lastName: sLastName,
					position: sPosition,
					age: sAge,
				};

				oModel.update(`/Players(${sPlayerID})`, oPayload, {
					success: (oRes) => {
						this.refreshView();
						MessageBox.success(
							`Player ${sName} ${sLastName} updated`
						);
					},
					error: (oErr) => {
						MessageBox.error('Something went wrong');
						console.error(oErr.message);
					},
				});
				this.byId('updatePlayerDialog').close();
				this.clearFields();
			},

			clearFields: function () {
				const oView = this.getView();
				if (oView.byId('playerName'))
					oView.byId('playerName').setValue('');
				if (oView.byId('playerLastName'))
					oView.byId('playerLastName').setValue('');
				if (oView.byId('playerAge'))
					oView.byId('playerAge').setValue(16);
				if (oView.byId('playerPosition'))
					oView.byId('playerPosition').setSelectedItem('');
			},

			refreshView: function () {
				this.getView()
					.byId('playersTable')
					.getBinding('items')
					.refresh();
			},

			onPressCancel: function () {
				if (this.byId('addNewPlayerDialog')) {
					this.byId('addNewPlayerDialog').close();
				}
				if (this.byId('updatePlayerDialog')) {
					this.byId('updatePlayerDialog').close();
				}
				this.clearFields();
			},

			onNavButton: function () {
				window.history.go(-1);
			},
		});
	}
);
