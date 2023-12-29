sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("frontendapp.controller.PlayersList", {
      onInit: function () {
        const oSelectPosition = [
          {
            Name: "Attacker",
            Icon: "sap-icon://feeder-arrow",
          },
          {
            Name: "Midfielder",
            Icon: "sap-icon://feeder-arrow",
          },
          {
            Name: "Defender",
            Icon: "sap-icon://feeder-arrow",
          },
          {
            Name: "Goalkeeper",
            Icon: "sap-icon://feeder-arrow",
          },
        ];
        this.getView().setModel(new JSONModel(oSelectPosition), "SelectModel");
      },

      onPressAddPlayer: function () {
        if (!this.createNewTeamDialog) {
          this.createNewTeamDialog = this.loadFragment({
            name: "frontendapp.view.fragment.AddNewPlayerDialog",
          });
        }
        this.createNewTeamDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      addPlayer: function () {
        const oModel = this.getView().getModel();
        // walidacja
        const sName = this.getView().byId("playerName").getValue();
        const sLastName = this.getView().byId("playerLastName").getValue();
        const sAge = this.getView().byId("playerAge").getValue();
        const sPosition = this.getView().byId("playerPosition").getValue();

        const oPayload = {
          name: sName,
          lastName: sLastName,
          position: sPosition,
          age: sAge,
        };

        oModel.create("/Players", oPayload, {
          method: "POST",
          success: (oRes) => {
            this.refreshView();
            MessageBox.success(`Player ${sName} ${sLastName} added`);
          },
          error: (oErr) => {
            MessageBox.error("Something went wrong");
            console.error(oErr.message);
          },
        });
        this.byId("addNewPlayerDialog").close();
        this.clearFields();
      },

      clearFields: function () {
        this.getView().byId("playerName").setValue("");
        this.getView().byId("playerLastName").setValue("");
        this.getView().byId("playerAge").setValue(16);
        this.getView().byId("playerPosition").setValue("");
      },

      refreshView: function () {
        this.getView().byId("playersTable").getBinding("items").refresh();
      },

      onPressCancel: function () {
        this.byId("addNewPlayerDialog").close();
      },

      onNavButton: function () {
        window.history.go(-1);
      },
    });
  }
);
