// eslint-disable-next-line ui5/hungarian-notation, no-unused-vars
const cds = require('@sap/cds');

module.exports = (srv) => {
	srv.before(['CREATE', 'UPDATE'], 'Teams', (req) => {
		const oData = req.data;
		if (oData.logo.length === 0)
			oData.logo =
				'https://www.seekpng.com/png/small/28-289657_espn-soccer-team-logo-default.png';
	});
};
