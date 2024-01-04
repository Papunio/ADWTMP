sap.ui.define(
	['sap/ui/core/mvc/Controller', 'sap/m/MessageBox'],
	function (BaseController, MessageBox) {
		'use strict';

		return BaseController.extend('frontendapp.controller.AddMatch', {
			onInit: function () {
				this.byId('matchDate').setMinDate(new Date());
			},

			onPressAccept: function () {
				const oView = this.getView();
				const oModel = this.getView().getModel();

				const sMatchID = globalThis.crypto.randomUUID();
				const sMatchPlace = oView.byId('matchPlace').getValue();
				const sMatchDate = oView.byId('matchDate').getValue();
				const sHomeTeamID = oView.byId('homeTeam').getSelectedKey();
				const sGuestTeamID = oView.byId('guestTeam').getSelectedKey();

				const aTeams = [
					// TUTAJ POKMINIC TRZEBA XD
					{
						up__ID: sMatchID,
						team_ID: sHomeTeamID,
					},
					{
						up__ID: sMatchID,
						team_ID: sGuestTeamID,
					},
				];

				const oPayload = {
					ID: sMatchID,
					teams: aTeams,
					place: sMatchPlace,
					date: sMatchDate,
				};
				oModel.create('/Matches', oPayload, {
					method: 'POST',
					success: (oRes) => {
						MessageBox.success(`Match between XD added`);
					},
					error: (oErr) => {
						MessageBox.error('Something went wrong');
						console.error(oErr.message);
					},
				});

				// sap.ui
				// 	.getCore()
				// 	.byId('container-frontendapp---Home--toBePlayedTable')
				// 	.getBinding('items')
				// 	.refresh();
				window.history.go(-1);
			},
			onNavButton: function () {
				window.history.go(-1);
			},
		});
	}
);
