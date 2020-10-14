sap.ui.define(
	["urungiris/controller/BaseController",
		"sap/m/MessageToast",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"urungiris/controller/formatter",
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		"sap/m/MessageBox"
	],
	function (BaseController, MessageToast, Filter, FilterOperator, formatter, jQuery, Fragment, MessageBox) {
		"use strict";

		return BaseController.extend("urungiris.controller.IadeListesiGiris", {
			formatter: formatter,

			onInit: function (oEvent) {

				var oRouter = this.getRouter();
				oRouter.getRoute("iadeListesiGiris").attachMatched(
					this._onRouteMatched,
					this);
			},

			_onRouteMatched: function (oEvent) {

				//İade listi burada depo no göndererek bind edeceksin
				var oArgs = oEvent.getParameter("arguments");
				this.personelNo = oArgs.PersonelNo;
				this.type = oArgs.Type;

				this.getView().byId("inpKullanici").setValue("");
				this.getView().byId("mcbBimKullanici").setValue("");
				this.getView().byId("mcbBimKullanici").clearSelection();

				if (this.type === "B") {
					this.getView().byId("inpKullanici").setVisible(true);
					this.getView().byId("inpKullanici").setValue(this.personelNo);

					this.getView().byId("mcbBimKullanici").setVisible(false);
					this.getView().byId("mcbBimKullanici").setEnabled(false);

				} else if (this.type === "C") {

					this.getView().byId("inpKullanici").setVisible(false);

					this.getView().byId("mcbBimKullanici").setVisible(true);
					this.getView().byId("mcbBimKullanici").setEnabled(true);

				}

				var currDt = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
				var istBas = currDt.getDate() + "." + (currDt.getMonth() + 1) + "." + currDt.getFullYear();
				this.getView().byId("dtBasTrh").setValue(istBas);

				var currDt = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
				var istBts = currDt.getDate() + "." + (currDt.getMonth() + 1) + "." + currDt.getFullYear();
				this.getView().byId("dtBtsTrh").setValue(istBts);

			},

			onSelChangKullanici: function (oEvent) {
				var changedItem = oEvent.getParameter("changedItem");
				var isSelected = oEvent.getParameter("selected");
				var state = "Selected";

				if (!isSelected) {
					state = "Deselected";
				}

				//Check if "Selected All is selected 
				if (changedItem.getProperty("key") == "Tümü") {
					var oName, res;

					//If it is Selected
					if (state == "Selected") {

						var oItems = oEvent.getSource().getAggregation("items");
						for (var i = 0; i < oItems.length; i++) {
							if (i == 0) {
								oName = oItems[i].getProperty("key");
							} else {
								oName = oName + ',' + oItems[i].getProperty("key");
							} //If i == 0									
						} //End of For Loop

						res = oName.split(",");
						oEvent.getSource().setSelectedKeys(res);

					} else {
						res = null;
						oEvent.getSource().setSelectedKeys(res);
					}
				}
			},

			onPressIleri: function (oEvent) {
				var basTrh = this.getView().byId("dtBasTrh").getValue();
				var btsTrh = this.getView().byId("dtBtsTrh").getValue();
				var kullanici = this.getView().byId("inpKullanici").getValue();

				var data = {
					Kullanici: []
				};

				var mcbBimKullanici = this.getView().byId("mcbBimKullanici").getSelectedItems();

				if (this.type === "B") {
					data.Kullanici.push(kullanici);
				} else if (this.type === "C") {
					for (var i = 0; mcbBimKullanici.length > i; i++) {
						kullanici = mcbBimKullanici[i].getBindingContext().getProperty().Uname;
						data.Kullanici.push(kullanici);
					}
				}

				this.getRouter().navTo("iadeListesi", {
					PersonelNo: this.personelNo,
					Type: this.type,
					BasTrh: basTrh,
					BtsTrh: btsTrh,
					Kullanici: JSON.stringify(data)
				});
			}

		});
	});