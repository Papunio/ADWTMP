sap.ui.define(["sap/ui/core/format/DateFormat"], (DateFormat) => {
	"use strict";

	return {
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
			if (sPosition === "Attacker") {
				return "Error";
			}
			if (sPosition === "Defender") {
				return "Indication07";
			}
			if (sPosition === "Midfielder") {
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
