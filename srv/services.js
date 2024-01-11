// eslint-disable-next-line ui5/hungarian-notation, no-unused-vars
const cds = require("@sap/cds");

module.exports = (srv) => {
	srv.before(["CREATE", "UPDATE"], "Teams", (oReq) => {
		const oData = oReq.data;
		if (oData.logo.length === 0)
			oData.logo =
				"https://www.seekpng.com/png/small/28-289657_espn-soccer-team-logo-default.png";
	});

	srv.after("READ", "Players", (aPlayers) => {
		aPlayers.sort((oPlayer, oOtherPlayer) => {
			return oPlayer.lastName.localeCompare(oOtherPlayer.lastName);
		});
	});

	srv.after("READ", "Teams", (aTeams) => {
		aTeams.sort((oTeam, oOtherTeam) => {
			return oTeam.name.localeCompare(oOtherTeam.name);
		});
	});

	srv.after("READ", "FinishedMatches", (aMatches) => {
		aMatches.sort((oMatch, oOtherMatch) => {
			return Date.parse(oMatch.date) > Date.parse(oOtherMatch.date) ? 1 : -1;
		});
	});
};
