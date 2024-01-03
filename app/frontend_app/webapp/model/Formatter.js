sap.ui.define(["sap/ui/core/format/DateFormat"], (DateFormat) => {
  "use strict";

  return {
    formatDate: function (sDate) {
      if (!sDate) {
        return "";
      }
      return DateFormat.getDateInstance({
        pattern: "dd-MM-yyyy",
      }).format(sDate);
    },
  };
});
