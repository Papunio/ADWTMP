sap.ui.define(["sap/ui/core/format/DateFormat"], (DateFormat) => {
	"use strict";

	return {
		getI18nText: function (sText, aArguments) {
			return this.getOwnerComponent()
				.getModel("i18n")
				.getResourceBundle()
				.getText(sText, aArguments);
		},
		formatDate: function (sDate) {
			if (!sDate) {
				return "";
			}
			return DateFormat.getDateInstance({
				pattern: "dd-MM-yyyy HH:mm",
			}).format(sDate);
		},

		highlightPosition: function (sPosition) {
			if (sPosition === "") {
				return "None";
			}
			if (sPosition === "A") {
				return "Error";
			}
			if (sPosition === "D") {
				return "Indication07";
			}
			if (sPosition === "M") {
				return "Information";
			} else {
				return "Success";
			}
		},

		checkDate: function (sDate) {
			if (Date.parse(sDate) < Date.parse(new Date())) {
				return "Error";
			}
			return "None";
		},
	};
});
