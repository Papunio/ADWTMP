sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"../model/Formatter",
	],
	function (BaseController, JSONModel, MessageBox, Filter, FilterOperator, Formatter) {
		"use strict";

		return BaseController.extend("frontendapp.controller.PlayersList", {
			formatter: Formatter,
			onInit: function () {
				const oComponent = this.getOwnerComponent();
				const oPlayersModel = new JSONModel();
				const oSelectPositionModel = new JSONModel();

				oComponent.setModel(oPlayersModel, "playersModel");
				oComponent.setModel(oSelectPositionModel, "selectPositionModel");

				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("PlayersList").attachPatternMatched(this._onPatternMatched, this);
			},

			_onPatternMatched: function () {
				this.refreshTable();
			},

			getI18nText: function (sText, aArguments) {
				return this.getOwnerComponent()
					.getModel("i18n")
					.getResourceBundle()
					.getText(sText, aArguments);
			},

			onPressAddPlayer: function () {
				if (!this.createNewPlayerDialog) {
					this.createNewPlayerDialog = this.loadFragment({
						name: "frontendapp.view.fragment.AddNewPlayerDialog",
					});
				}
				this.createNewPlayerDialog.then(function (oDialog) {
					oDialog.open();
				});
			},

			addPlayer: function () {
				const oView = this.getView();
				const oModel = oView.getModel();

				const sName = oView.byId("playerName").getValue();
				const sLastName = oView.byId("playerLastName").getValue();
				const sAge = oView.byId("playerAge").getValue();
				const sPositionID = oView.byId("playerPosition").getSelectedKey();

				if (sName === "") {
					MessageBox.error(this.getI18nText("enterName"));
					return;
				}
				if (sLastName === "") {
					MessageBox.error(this.getI18nText("enterLastName"));
					return;
				}
				if (!sPositionID) {
					MessageBox.error(this.getI18nText("selectPosition"));
					return;
				}

				const oPayload = {
					name: sName,
					lastName: sLastName,
					position_ID: sPositionID,
					age: sAge,
				};

				oModel.create("/Players", oPayload, {
					method: "POST",
					success: () => {
						this.refreshTable();
						MessageBox.success(this.getI18nText("playerAdded", [sName, sLastName]));
					},
					error: (oErr) => {
						MessageBox.error(this.getI18nText("errorMessage"));
						console.error(oErr.message);
					},
				});
				this.byId("addNewPlayerDialog").close();
				this.clearFields();
			},

			onPressUpdatePlayer: function (oEvent) {
				const oView = this.getView();
				const oPlayer = oEvent.getSource().getBindingContext("playersModel").getObject();

				const oPlayerModel = new JSONModel(oPlayer);

				if (!this.updatePlayerDialog) {
					this.updatePlayerDialog = this.loadFragment({
						name: "frontendapp.view.fragment.UpdatePlayerDialog",
					});
				}
				this.updatePlayerDialog.then(function (oDialog) {
					oView.setModel(oPlayerModel, "playerModel");
					oDialog.open();
				});
			},

			updatePlayer: function () {
				const oView = this.getView();
				const oModel = oView.getModel();
				const sPlayerID = oView.getModel("playerModel").getData().ID;
				const sName = oView.byId("playerNameU").getValue();
				const sLastName = oView.byId("playerLastNameU").getValue();
				const sAge = oView.byId("playerAgeU").getValue();
				const sPositionID = oView.byId("playerPositionU").getSelectedKey();

				if (sName === "") {
					MessageBox.error(this.getI18nText("enterName"));
					return;
				}
				if (sLastName === "") {
					MessageBox.error(this.getI18nText("enterLastName"));
					return;
				}
				if (!sPositionID) {
					MessageBox.error(this.getI18nText("selectPosition"));
					return;
				}

				const oPayload = {
					name: sName,
					lastName: sLastName,
					position_ID: sPositionID,
					age: sAge,
				};

				oModel.update(`/Players(${sPlayerID})`, oPayload, {
					success: () => {
						this.refreshTable();
						MessageBox.success(this.getI18nText("playerUpdated", [sName, sLastName]));
					},
					error: (oErr) => {
						MessageBox.error(this.getI18nText("errorMessage"));
						console.error(oErr.message);
					},
				});
				this.byId("updatePlayerDialog").close();
				this.clearFields();
			},

			onPressDeletePlayer: function (oEvent) {
				const oPlayer = oEvent.getSource().getBindingContext("playersModel").getObject();

				MessageBox.confirm(
					this.getI18nText("confirmPlayerDelete", [oPlayer.name, oPlayer.lastName]),
					{
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								this.deletePlayer(oPlayer.ID, oPlayer.name, oPlayer.lastName);
							}
						}.bind(this),
					}
				);
			},

			deletePlayer: function (sPlayerID, sPlayerName, sPlayerLastName) {
				const oView = this.getView();
				const oModel = oView.getModel();
				let bInTeam = false;

				const oPromise = new Promise((resolve, reject) => {
					oModel.read(`/Teams_players`, {
						success: (oData) => {
							oData.results.forEach((oTeamPlayerLink) => {
								if (oTeamPlayerLink.player_ID === sPlayerID) {
									bInTeam = true;
									resolve();
									return;
								}
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
					if (!bInTeam) {
						oModel.remove(`/Players(${sPlayerID})`, {
							success: () => {
								MessageBox.success(
									this.getI18nText("playerDeleted", [
										sPlayerName,
										sPlayerLastName,
									])
								);
							},
							error: (oErr) => {
								MessageBox.error(this.getI18nText("errorMessage"));
								console.error(oErr.message);
							},
						});
						this.refreshTable();
					} else {
						MessageBox.error(this.getI18nText("playerInATeam"));
					}
				});
			},

			onPressPlayer: function (oEvent) {
				const oView = this.getView();
				const oModel = oView.getModel();
				const oPlayer = oEvent.getSource().getBindingContext("playersModel").getObject();
				let sTeam;

				const oPromise = new Promise((resolve) => {
					oModel.read(`/Players(${oPlayer.ID})`, {
						urlParameters: {
							$expand: "team/up_",
						},
						success: (oData) => {
							if (oData.team) {
								sTeam = oData.team.up_.name;
							}
							resolve();
						},
						error: (oErr) => {
							MessageBox.error(this.getI18nText("errorMessage"));
							console.error(oErr.message);
						},
					});
				});

				oPromise.then(() => {
					if (sTeam) {
						MessageBox.information(
							this.getI18nText("playerIsInATeam", [
								oPlayer.name,
								oPlayer.lastName,
								sTeam,
							])
						);
					} else {
						MessageBox.information(this.getI18nText("playerNotInATeam"));
					}
				});
			},

			onSearch: function (oEvent) {
				let oTableSearchState = [],
					sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					oTableSearchState = [new Filter("lastName", FilterOperator.Contains, sQuery)];
				}

				this.oView
					.byId("playersTable")
					.getBinding("items")
					.filter(oTableSearchState, "Application");
			},

			clearFields: function () {
				const oView = this.getView();
				if (oView.byId("playerName")) oView.byId("playerName").setValue();
				if (oView.byId("playerLastName")) oView.byId("playerLastName").setValue();
				if (oView.byId("playerAge")) oView.byId("playerAge").setValue(16);
				if (oView.byId("playerPosition")) oView.byId("playerPosition").setSelectedItem();
			},

			refreshView: function () {
				this.getView().byId("playersTable").getBinding("items").refresh();
			},

			onPressCancel: function () {
				if (this.byId("addNewPlayerDialog")) {
					this.byId("addNewPlayerDialog").close();
				}
				if (this.byId("updatePlayerDialog")) {
					this.byId("updatePlayerDialog").close();
				}
				this.clearFields();
			},

			refreshTable: function () {
				const oComponent = this.getOwnerComponent();
				const oModel = this.getView().getModel();

				const oPlayersModel = oComponent.getModel("playersModel");
				const oSelectPositionModel = oComponent.getModel("selectPositionModel");

				oModel.read(`/Players`, {
					urlParameters: {
						$expand: "position",
					},
					success: (oData) => {
						oPlayersModel.setData(oData.results);
					},
					error: (oErr) => {
						MessageBox.error(this.getI18nText("errorMessage"));
						console.error(oErr.message);
					},
				});

				oModel.read(`/Positions`, {
					success: (oData) => {
						oSelectPositionModel.setData(oData.results);
					},
					error: (oErr) => {
						MessageBox.error(this.getI18nText("errorMessage"));
						console.error(oErr.message);
					},
				});
			},

			onNavButton: function () {
				window.history.go(-1);
			},
		});
	}
);
