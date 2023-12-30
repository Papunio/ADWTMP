sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("frontendapp.controller.TeamsList", {
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
        const aSelectedPlayers = oView
          .byId("selectedPlayers")
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
      onTeamPress: function () {
        console.log("XD ON TEAMPRESS");
      },

      refreshView: function () {
        this.getView().byId("teamsTable").getBinding("items").refresh();
      },
      clearFields: function () {
        this.getView().byId("teamName").setValue("");
        this.getView().byId("badge").setValue("");
        this.getView().byId("selectedPlayers").removeAllSelectedItems();
      },

      onPressCancel: function () {
        this.byId("addNewTeamDialog").close();
      },
      onNavButton: function () {
        window.history.go(-1);
      },
    });
  }
);
