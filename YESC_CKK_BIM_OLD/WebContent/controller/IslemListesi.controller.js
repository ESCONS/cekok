sap.ui.define(
	["urungiris/controller/BaseController",
		"sap/m/MessageToast",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"urungiris/controller/formatter",
		"sap/m/MessageBox"
	],
	function (BaseController, MessageToast, Filter, FilterOperator, formatter, MessageBox) {
		"use strict";

		return BaseController.extend("urungiris.controller.IslemListesi", {
			formatter: formatter,
			onInit: function (oEvent) {

				var oRouter = this.getRouter();
				oRouter.getRoute("islemListesi").attachMatched(
					this._onRouteMatched,
					this);

			},

			_onRouteMatched: function (oEvent) {

				var oArgs = oEvent.getParameter("arguments");
				this.uname = oArgs.Uname;
				this.type = oArgs.Type;
				this.message = oArgs.Message;
				
				this.getView().byId("msgStrHeader").setText(this.message);
				var lstMenu = this.getView().byId("lstMenu");

				var oFilter = new Filter(
					"Type",
					FilterOperator.EQ,
					this.type);

				var that = this;
				lstMenu.bindItems({
					path: "/GetMenuSet",
					template: new sap.m.StandardListItem({
						title: "{MenuText}",
						type: "Navigation",
						icon: {
							parts: [{
								path: "MenuNumber"
							}],
							formatter: formatter.menuIcon
						},

						press: function (oEvent) {
							that.onPressList(oEvent);
						}
					}),
					filters: oFilter
				});

			},

			onPressList: function (oEvent) {

				var listItem = oEvent.getSource().getBindingContext().getProperty();

				if (listItem.Type === "ADMIN" || listItem.Type === "CEKOK") {
					this.type = "C";
				} else if (listItem.Type === "BIM") {
					this.type = "B";
				}
				if (listItem.MenuNumber === "0001") {
					this.getRouter().navTo("iadeGiris", {
						PersonelNo: this.uname,
						Type: this.type
					});
				} else if (listItem.MenuNumber === "0002") {
					this.getRouter().navTo("iadeListesiGiris", {
						PersonelNo: this.uname,
						Type: this.type
					});
				} else if (listItem.MenuNumber === "0003") {
					this.getRouter().navTo("dashboardGiris", {
						PersonelNo: this.uname,
						Type: this.type
					});
				}

			}

		});
	});