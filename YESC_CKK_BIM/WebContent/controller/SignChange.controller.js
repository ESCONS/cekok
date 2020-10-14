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

		return BaseController.extend("urungiris.controller.SignChange", {
			formatter: formatter,
			onInit: function (oEvent) {

				var oRouter = this.getRouter();
				oRouter.getRoute("signChange").attachMatched(
					this._onRouteMatched,
					this);

				// this.oView = this.getView();
				// this.oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.oView));
				// this.oResourceBundle = this.oComponent.getModel(this.oComponent.i18nModelName).getResourceBundle();
				// this.oRouter = this.oComponent.getRouter();
				// this.oRouter.attachRoutePatternMatched(this.onRoutePatternMatched, this);

			},

			_onRouteMatched: function (oEvent) {

				var oArgs = oEvent.getParameter("arguments");
				this.uname = oArgs.Username;

				this.byId("idUserNameInput").setValue("");
				this.byId("idOldPass").setValue("");
				this.byId("idNewPass").setValue("");
				this.byId("idNewPassRe").setValue("");

				this.byId("idUserNameInput").setValue(this.uname);

			},
			handleChangePassword: function (oEvent) {

				var username = this.byId("idUserNameInput").getValue();
				var oldpass = this.byId("idOldPass").getValue();
				var newpass = this.byId("idNewPass").getValue();
				var newpassre = this.byId("idNewPassRe").getValue();

				if (username == "" || oldpass == "" || newpass == "" || newpassre == "") {

					sap.m.MessageBox.alert("Bütün Alanları Doldurunuz");

				} else {
					if (newpass != newpassre) {
						sap.m.MessageBox.alert("Şifreler Eşleşmiyor");

					} else {

						if (newpass == oldpass) {
							sap.m.MessageBox.alert("Eski Şifre ve Yeni Şifre aynı olamaz");
							return;
						}

						var that = this;
						this.oView.getModel().callFunction("/ChangePassword", {
							urlParameters: {
								NewPassword: newpass,
								Password: oldpass,
								Username: username
							},
							success: function (oData, Response) {
								if (oData.Return == "S") {

									sap.m.MessageBox.alert(oData.Message, {
										onClose: function (oAction) {
											that.onNavBack();
										}
									});
								} else {

									sap.m.MessageBox.alert(oData.Message);
								}

							},
							error: function (error) {
								that.getMessage("error");
							},
						});

					}

				}

			}

		});
	});