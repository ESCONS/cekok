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

		return BaseController.extend("urungiris.controller.SignUp", {
			formatter: formatter,
			onInit: function (oEvent) {

				var oRouter = this.getRouter();
				oRouter.getRoute("signUp").attachMatched(
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

				// this.sPageName = oEvent.getParameter("name");
				this.byId("idActivationForm").setVisible(false);
				this.byId("idLoginForm").setVisible(true);
				// this.byId("idSignUpPage").setTitle(this.oResourceBundle.getText("LOGIN_PAGE"));
				this.oUserName = this.byId("idUserNameInput");
				this.oLoginPassword = this.byId("idLoginPasswordInput");
				this.oUserName.setValue("");
				this.oLoginPassword.setValue("");

				var that = this;

			},

			// onPressKey: function () { 
			// 	var t = this;
			// 	this.byId("idLoginPasswordInput").attachBrowserEvent('keypress', function (e) {
			// 		if (e.which === 13) {
			// 			t.handleLoginButtonPress();
			// 		}
			// 	});

			// 	this.byId("idUserNameInput").attachBrowserEvent('keypress', function (e) {
			// 		if (e.which === 13) {
			// 			t.handleLoginButtonPress();
			// 		}
			// 	});
			// },
			_getDialog: function () {
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("urungiris.view.fragments.sendInfo");
					this.getView().addDependent(this._oDialog);
				}
				return this._oDialog;
			},
			onOpenDialog: function () {
				this._getDialog().open();
				this.send3D();
			},

			navToChangePass: function () {
				var uname = this.byId("idUserNameInput").getValue();
				if (uname == "")
					uname = " ";
					 
				this.getRouter().navTo("signChange", {
					Username: uname
				});

			},

			handleSignupButtonPress: function () {
				this.oRouter.navTo("signup", {});
			},

			// onNavBack: function () {
			// 	cus.PKT.BIMIADE.util.Util.onNavBack(-1);
			// },

			onRaidoButtonSelectedChange: function (oEvent) {
				var index = oEvent.getSource().getSelectedIndex();
				this._setForm(index);
			},

			_setForm: function (index) {
				if (index === 0) {
					this.byId("idIndividualFormContainer").setVisible(true);
					this.byId("idCorporateFormContainer").setVisible(false);
				} else {
					this.byId("idIndividualFormContainer").setVisible(false);
					this.byId("idCorporateFormContainer").setVisible(true);
				}
			},

			handleSaveActivationButtonPress: function () {

				if (!this.checkSignUpForm("idActivationForm")) {
					sap.m.MessageBox.alert(this.oResourceBundle.getText("FIELDS_REQUIRED"));
					return;
				}
				if (!this.bPasswordMatch) {
					this.oRePassword.setValueState("Error");
					sap.m.MessageBox.alert(this.oResourceBundle.getText("PASS_NOT_MATCH"));
					return;
				}

				sap.ui.core.BusyIndicator.show(0);
				var t = this;
				var oUserRequest = {
					RequestID: this.sRequestID,
					ActivationKey: this.sActivationKey,
					Password: this.oPassword.getValue()
				};

				t.oView.getModel().update("/UserRequestActivationRequestCollection('" + this.sRequestID + "')", oUserRequest, {
					success: function (resp) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.alert(t.oResourceBundle.getText("SUCCESS_SAVE_ACTIVATON"));
					},
					error: function (error) {
						// sap.ui.core.BusyIndicator.hide();
						// var resp = JSON.parse(error.response.body);
						// var sErrorText = resp.error.message.value;
						// sap.m.MessageBox.alert(sErrorText);
					}
				});
			},

			handleLoginButtonPress: function () {
				this.oUserName = this.byId("idUserNameInput");
				this.oLoginPassword = this.byId("idLoginPasswordInput");

				// sap.ui.core.BusyIndicator.show(0);

				var t = this;
				var sObjectPath = this.oView.getModel().createKey("/BimLoginSet", {
					Uname: this.oUserName.getValue(),
					Password: this.oLoginPassword.getValue()
				});

				var log = "";
				this.oView.getModel().read(sObjectPath, null, null, true,
					function (oData, oResponse) {

						sap.ui.core.BusyIndicator.hide();

						// t.setCookie("user",
						// 	cus.PKT.BIMIADE.util.Util.b64EncodeUnicode(oData.Uname + "|" +
						// 		oData.Guid.replaceAll("-", "") + "|" +
						// 		oData.UserType + "|" +
						// 		oData.Kunnr + "|" +
						// 		oData.Bukrs
						// 	), 365);

						if (oData.Return === "SUCCESS") {

							// MessageToast.show(oData.Message, {
							// 	width: "25em",
							// 	duration: 3000
							// });
							t._navToMyBills(oData);

						} else {
							sap.m.MessageBox.alert(oData.Message);
							//  sap.m.MessageBox.alert(t.oResourceBundle.getText("ERROR"));
						}
					},
					function (error) {

						sap.ui.core.BusyIndicator.hide();
						var resp = JSON.parse(error.response.body);
						var sErrorText = resp.error.message.value;
						sap.m.MessageBox.alert(sErrorText);
					}
				);

			},

			setCookie: function (cname, cvalue, exdays) {
				var d = new Date();
				d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
				var expires = "expires=" + d.toUTCString();
				document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
			},

			deleteCookie: function (cname) {
				document.cookie = cname + '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				this.setLoginLogout("", true, this.oResourceBundle.getText("LOGIN"));
			},

			_navToMyBills: function (_oData) {
				var id = this.byId("idUserNameInput").getValue();

				// this.oRouter.navTo("mybills", {
				// 	userID: id
				// });
				this.getRouter().navTo("islemListesi", {
					Uname: _oData.Uname,
					Type: _oData.UserType,
					Message:_oData.Message
				});
			},

			onPasswordLiveChange: function () {
				// if (!cus.PKT.BIMIADE.util.Util.isEmpty(this.oPassword.getValue())) {
				// 	this.oPassword.setValueState("None");
				// }

				if (this.oPassword.getValue() !== this.oRePassword.getValue()) {
					this.oRePassword.setValueState("Error");
					this.oRePassword.setValueStateText(this.oResourceBundle.getText("PASS_NOT_MATCH"));
					this.bPasswordMatch = false;
				} else {
					this.oRePassword.setValueState("None");
					this.bPasswordMatch = true;
				}
			},

			onInputLiveChange: function (oEvent) {
				var sVal = oEvent.getParameter("value");
				if (sVal.length > 0) {
					oEvent.getSource().setValueState("None");
				} else {
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText(this.oResourceBundle.getText("NOT_NULL"));
				}
			},

			checkSignUpForm: function (sFormId) {
				var status = true;
				var oform = this.byId(sFormId);
				var pageId = this.oView.getId();
				var iSelectedIndex = this.byId("idRadioButtonGroup").getSelectedIndex();
				var oContainers = oform.getFormContainers();
				for (var i = 0; i < oContainers.length; i++) {
					if (iSelectedIndex === 0 && oContainers[i].getId() === this.byId("idCorporateFormContainer").getId()) continue;
					else if (iSelectedIndex === 1 && oContainers[i].getId() === this.byId("idIndividualFormContainer").getId()) continue;
					var oElements = oContainers[i].getFormElements();
					for (var k = 0; k < oElements.length; k++) {
						var oFileds = oElements[k].getFields();
						for (var j = 0; j < oFileds.length; j++) {
							var regxInput = new RegExp(pageId + "--[A-z0-9]+Input", "g");
							var regxMail = new RegExp(pageId + "--[A-z0-9]+EmailInput", "g");
							var regxTckn = new RegExp(pageId + "--[A-z0-9]+TCKNInput", "g");
							var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
							var regxSelect = new RegExp(pageId + "--[A-z0-9]+Select", "g");
							var itemId = oFileds[j].getId();
							if (regxInput.test(itemId)) {
								if (!oFileds[j].getValue()) {
									oFileds[j].setValueState("Error");
									oFileds[j].setValueStateText(this.oResourceBundle.getText("NOT_NULL"));
									status = false;
								} else {
									if (regxMail.test(itemId)) {
										if (!oFileds[j].getValue().match(mailregex)) {
											oFileds[j].setValueState("Error");
											oFileds[j].setValueStateText(this.oResourceBundle.getText("NOT_MAIL_ADDRESS"));
											status = false;
										} else {
											oFileds[j].setValueState("None");
										}
									} else if (regxTckn.test(itemId)) {
										if (oFileds[j].getValue().length < 11) {
											oFileds[j].setValueState("Error");
											oFileds[j].setValueStateText(this.oResourceBundle.getText("NOT_TCKN"));
											status = false;
										} else {
											oFileds[j].setValueState("None");
										}
									} else {
										oFileds[j].setValueState("None");
									}
								}
							} else if (regxSelect.test(itemId)) {
								if (oFileds[j].getId().indexOf("idGenderSelect") && oFileds[j].getSelectedKey() === "0") {
									oFileds[j].addStyleClass("SelectError");
									status = false;
								}
								if (oFileds[j].getSelectedKey() === "0" || oFileds[j].getSelectedKey() === "") {
									oFileds[j].addStyleClass("SelectError");
									status = false;
								} else {
									oFileds[j].removeStyleClass("SelectError");
								}
							}
						}

					}
				}
				return status;
			},

		});
	});