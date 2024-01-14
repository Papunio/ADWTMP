sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
	"use strict";

	return BaseController.extend("frontendapp.controller.MatchHistory", {
		onInit: function () {
			const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("MatchHistory").attachPatternMatched(this._onPatternMatched, this);
		},

		_onPatternMatched: function () {
			const oView = this.getView();
			const oSmartTable = oView.byId("finishedMatchesTable");

			if (oSmartTable) {
				oSmartTable.rebindTable();
			}
		},

		onNavButton: function () {
			window.history.go(-1);
		},
	});
});
