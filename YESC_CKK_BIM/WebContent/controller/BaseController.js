sap.ui.define(
	["sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"sap/m/MessageToast",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/FilterType",
		"jquery.sap.global"
	],
	function (Controller, History, MessageToast, Filter, FilterOperator, FilterType, jQuery) {
		"use strict";
		jQuery.sap.require("sap.ui.core.format.NumberFormat");
		var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			maxFractionDigits: 2,
			groupingEnabled: true,
			groupingSeparator: "",
			decimalSeparator: ","
		});

		return Controller.extend("urungiris.controller.BaseController", {

			getRouter: function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},

			onNavBack: function () {
				var oHistory, sPreviousHash;

				oHistory = History.getInstance();
				sPreviousHash = oHistory.getPreviousHash();

				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					this.getRouter().navTo("signUp", {}, true /*no history*/ );
				}
			},

			getMessage: function (msgName) {
				var message = this.getView().getModel("i18n").getResourceBundle().getText(msgName);
				MessageToast.show(message, {
					width: "25em",
					duration : 4000
				});
			},

			_setFilterVHR: function (oBinding, oFilters) {
				oBinding.filter(new Filter({
					filters: oFilters,
					and: false,
				}), FilterType.Application);
			},

			_setDate: function (addDay) {

				if (!addDay) {
					var currDt = new Date();
				} else {
					var currDt = new Date(new Date().getTime() + addDay * 24 * 60 * 60 * 1000);
				}

				return currDt.getDate() + "." + (currDt.getMonth() + 1) + "." + currDt.getFullYear();
			},

			_bindComboBox: function (slct, oFilter, key, tanim, service) {
				slct.unbindItems();

				var oSelectTemp = new sap.ui.core.Item({
					key: key,
					text: tanim
				});

				slct.bindItems({
					path: service,
					async: false,
					template: oSelectTemp,
					filters: oFilter
				});
			},

			getSelectedFieldTbl: function (table, prop) {

				var selectedContexts = table.getSelectedContexts();

				if (selectedContexts.length <= 0) {
					this.getMessage("tabloSecimError");
					return null;
				}

				return selectedContexts[0].getProperty(prop);

			},

			onValueHelpRequestNew: function (oEvent, Title, Url, IsMultiSelect, LabelTemplate, theTokenInput, input) {

				this.theTokenInput = theTokenInput;
				var that = this;
				that.onOpenDialog();

				this.aKeys = [];
				for (var i = 1; i < LabelTemplate.length; i = i + 2) {
					this.aKeys.push(LabelTemplate[i]);
				}

				var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					basicSearchText: this.theTokenInput.getValue(),
					title: Title,
					supportMultiselect: IsMultiSelect,
					supportRanges: false,
					supportRangesOnly: false,
					key: this.aKeys[0],
					descriptionKey: this.aKeys[1],
					stretch: sap.ui.Device.system.phone,

					ok: function (oControlEvent) {
						that.aTokens = oControlEvent.getParameter("tokens");
						that.theTokenInput.setTokens(that.aTokens);
						oValueHelpDialog.close();
					},

					cancel: function (oControlEvent) {
						oValueHelpDialog.close();
					},

					afterClose: function () {
						oValueHelpDialog.destroy();
					}
				});

				var oData = {
					cols: []
				};
				var tempLabel;
				for (var i1 = 0; i1 < LabelTemplate.length; i1++) {
					if (i1 % 2 === 0) {
						tempLabel = LabelTemplate[i1];
					} else {
						oData.cols.push({
							label: tempLabel,
							template: LabelTemplate[i1]
						});
					}
				}

				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData(oData);

				oValueHelpDialog.getTable().setModel(oColModel, "columns");

				var oModel = new sap.ui.model.json.JSONModel();

				// oModel.loadData(Url, null, true); //asenkron

				oModel.loadData(Url, null, false); //senkron

				oValueHelpDialog.getTable().setModel(oModel);

				if (oValueHelpDialog.getTable().bindRows) {
					oValueHelpDialog.getTable().bindRows("/d/results");
				}
				if (oValueHelpDialog.getTable().bindItems) {
					var oTable = oValueHelpDialog.getTable();

					oTable.bindAggregation(
						"items",
						"/d/results",
						function (sId, oContext) {
							var aCols = oTable.getModel("columns").getData().cols;

							return new sap.m.ColumnListItem({
								cells: aCols.map(function (column) {
									var colname = column.template;
									return new sap.m.Label({
										text: "{" + colname + "}"
									});
								})
							});
						});
				}

				oValueHelpDialog.setTokens(this.theTokenInput.getTokens());

				var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					advancedMode: true,
					filterBarExpanded: false,
					showGoOnFB: !sap.ui.Device.system.tablet,
					search: function (basicSearch) {

						var inp = sap.ui.getCore().byId("idSearchField");

						if (input) {
							oModel.loadData(Url + " and Search eq('" + inp.getValue() + "')", null, true);
						} else {
							oModel.loadData(Url + "?$filter=Search eq('" + inp.getValue() + "')", null, true);
						}

						oValueHelpDialog.getTable().getModel().setData(oModel.getData());
						oValueHelpDialog.getTable().clearSelection();
					}
				});

				if (oFilterBar.setBasicSearch) {

					oFilterBar.setBasicSearch(new sap.m.SearchField(
						"idSearchField", {
							showSearchButton: sap.ui.Device.system.phone,
							placeholder: Title,
							search: function (event) {
								that.onOpenDialog();
								var sUrl = Url + "and Search eq('" + this.getValue() + "')";
								$.ajax({
									cache: false,
									type: "GET",
									url: sUrl,
									dataType: "json",
									success: function (data, textStatus, jqXHR) {
										oValueHelpDialog.getTable().getModel().setData(data);
										that.onCloseDialog();
									},
									error: function (jqXHR, textStatus, errorThrown) {

										var message;

										if (jqXHR.responseJSON != undefined) {
											message = jqXHR.responseJSON.error.message.value;
										} else {
											message = errorThrown;
										}

										that.onCloseDialog();

										jQuery.sap.require("sap.m.MessageBox");
										sap.m.MessageBox.show(
											message, {
												icon: sap.m.MessageBox.Icon.ERROR,
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function () {}
											});
									}

								});
							}
						}));
				}

				oValueHelpDialog.setFilterBar(oFilterBar);

				oValueHelpDialog.addStyleClass("sapUiSizeCozy");

				oValueHelpDialog.open();

				oValueHelpDialog.update();
				that.onCloseDialog();

			},

			onValueHelpRequest: function (oEvent, Title, Url, IsMultiSelect, LabelTemplate, theTokenInput) {

				this.theTokenInput = theTokenInput;
				var that = this;
				that.onOpenDialog();

				this.aKeys = [];
				for (var i = 1; i < LabelTemplate.length; i = i + 2) {
					this.aKeys.push(LabelTemplate[i]);
				}

				var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					basicSearchText: this.theTokenInput.getValue(),
					title: Title,
					supportMultiselect: IsMultiSelect,
					supportRanges: false,
					supportRangesOnly: false,
					key: this.aKeys[0],
					descriptionKey: this.aKeys[1],
					stretch: sap.ui.Device.system.phone,

					ok: function (oControlEvent) {
						that.aTokens = oControlEvent.getParameter("tokens");
						that.theTokenInput.setTokens(that.aTokens);
						oValueHelpDialog.close();
					},

					cancel: function (oControlEvent) {
						oValueHelpDialog.close();
					},

					afterClose: function () {
						oValueHelpDialog.destroy();
					}
				});

				var oData = {
					cols: []
				};
				var tempLabel;
				for (var i1 = 0; i1 < LabelTemplate.length; i1++) {
					if (i1 % 2 === 0) {
						tempLabel = LabelTemplate[i1];
					} else {
						oData.cols.push({
							label: tempLabel,
							template: LabelTemplate[i1]
						});
					}
				}

				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData(oData);

				oValueHelpDialog.getTable().setModel(oColModel, "columns");

				var oModel = new sap.ui.model.json.JSONModel();

				// oModel.loadData(Url, null, true); //asenkron

				oModel.loadData(Url, null, false); //senkron

				oValueHelpDialog.getTable().setModel(oModel);

				if (oValueHelpDialog.getTable().bindRows) {
					oValueHelpDialog.getTable().bindRows("/d/results");
				}
				if (oValueHelpDialog.getTable().bindItems) {
					var oTable = oValueHelpDialog.getTable();

					oTable.bindAggregation(
						"items",
						"/d/results",
						function (sId, oContext) {
							var aCols = oTable.getModel("columns").getData().cols;

							return new sap.m.ColumnListItem({
								cells: aCols.map(function (column) {
									var colname = column.template;
									return new sap.m.Label({
										text: "{" + colname + "}"
									});
								})
							});
						});
				}

				oValueHelpDialog.setTokens(this.theTokenInput.getTokens());

				var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					advancedMode: true,
					filterBarExpanded: false,
					showGoOnFB: !sap.ui.Device.system.tablet,
					search: function (basicSearch) {

						var inp = sap.ui.getCore().byId("idSearchField");

						oModel.loadData(Url + " and Value eq('" + inp.getValue() + "')", null, true);

						// if (input) {
						// 	oModel.loadData(Url + " and Search eq('" + inp.getValue() + "')", null, true);
						// } else {
						// 	oModel.loadData(Url + "?$filter=Search eq('" + inp.getValue() + "')", null, true);
						// }

						oValueHelpDialog.getTable().getModel().setData(oModel.getData());
						oValueHelpDialog.getTable().clearSelection();
					}
				});

				if (oFilterBar.setBasicSearch) {

					oFilterBar.setBasicSearch(new sap.m.SearchField("idSearchField", {
						showSearchButton: sap.ui.Device.system.phone,
						placeholder: Title,
						search: function (event) {
							that.onOpenDialog();
							var sUrl = Url + " and Value eq('" + this.getValue() + "')";
							$.ajax({
								cache: false,
								type: "GET",
								url: sUrl,
								dataType: "json",
								success: function (data, textStatus, jqXHR) {
									oValueHelpDialog.getTable().getModel().setData(data);
									that.onCloseDialog();
								},
								error: function (jqXHR, textStatus, errorThrown) {

									var message;

									if (jqXHR.responseJSON != undefined) {
										message = jqXHR.responseJSON.error.message.value;
									} else {
										message = errorThrown;
									}

									that.onCloseDialog();

									jQuery.sap.require("sap.m.MessageBox");
									sap.m.MessageBox.show(
										message, {
											icon: sap.m.MessageBox.Icon.ERROR,
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function () {}
										});
								}

							});
						}
					}));
				}

				oValueHelpDialog.setFilterBar(oFilterBar);

				oValueHelpDialog.addStyleClass("sapUiSizeCozy");

				oValueHelpDialog.open();

				oValueHelpDialog.update();
				that.onCloseDialog();

			},
			onOpenDialog: function () {
				var oView = this.getView();
				var oDialog = oView.byId("BusyDialog");

				if (!oDialog) {
					oDialog = sap.ui.xmlfragment(oView.getId(), "urungiris.view.BusyDialog", this);
					oView.addDependent(oDialog);
				}
				oDialog.open();
			},

			onCloseDialog: function () {
				this.getView().byId("BusyDialog").close();
			}
		});
	});