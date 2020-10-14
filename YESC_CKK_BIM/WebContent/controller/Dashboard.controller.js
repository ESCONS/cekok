sap.ui.define(
	["urungiris/controller/BaseController",
		"sap/m/MessageToast",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"urungiris/controller/formatter",
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		"sap/m/MessageBox",
		"sap/viz/ui5/data/FlattenedDataset",
		"sap/viz/ui5/controls/common/feeds/FeedItem",
		"sap/viz/ui5/format/ChartFormatter"
	],
	function (BaseController, MessageToast, Filter, FilterOperator, formatter, jQuery, Fragment, MessageBox, FlattenedDataset, FeedItem,
		ChartFormatter) {
		"use strict";

		return BaseController.extend("urungiris.controller.Dashboard", {
			formatter: formatter,

			onInit: function (oEvent) {

				var oRouter = this.getRouter();
				oRouter.getRoute("dashboard").attachMatched(
					this._onRouteMatched,
					this);
			},

			_onRouteMatched: function (oEvent) {

				var oArgs = oEvent.getParameter("arguments");
				this.personelNo = oArgs.PersonelNo;
				this.type = oArgs.Type;

				var array = JSON.parse(oArgs.Kullanici);

				this.basTrh = oArgs.BasTrh;
				this.btsTrh = oArgs.BtsTrh;
				this.kullanici = oArgs.Kullanici;

				var aFilter = [];

				for (var i = 0; array.Kullanici.length > i; i++) {
					aFilter.push(new Filter(
						"Uname",
						FilterOperator.EQ,
						array.Kullanici[i]));
				}

				aFilter.push(new Filter(
					"BasTrh",
					FilterOperator.EQ,
					this.basTrh));

				aFilter.push(new Filter(
					"BtsTrh",
					FilterOperator.EQ,
					this.btsTrh));

				this._dataModel = {
					IadeData: [],
				};

				var sServiceUrl = "/sap/opu/odata/SAP/YESC_CKK_BIM_SRV";
				this._oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

				var that = this;
				this._oModel.read("/GetIadeStatDataSet", {
					async: false,
					filters: aFilter,
					success: function (oData) {

						for (var i = 0; oData.results.length > i; i++) {
							var result = oData.results[i];
							that._dataModel.IadeData.push({
								Statu: result.Statu,
								Deger: result.Deger
							});
						}

						// that.jSONMainModel.refresh();

					},
					error: function (error) {
						that.getMessage("error");
					}
				});

				var oVizFrame = this.getView().byId("idpiechart");
				oVizFrame.destroyFeeds();

				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(this._dataModel);

				var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: 'Statu',
						value: "{Statu}"
					}],
					measures: [{
						name: 'Deger',
						value: '{Deger}'
					}],
					data: {
						path: "/IadeData"
					}
				});
				oVizFrame.setDataset(oDataset);
				oVizFrame.setModel(oModel);

				oVizFrame.setVizProperties({
					title: {
						text: "Duruma Göre Dağılım Grafiği"
					},
					plotArea: {
						colorPalette: d3.scale.category20().range(),
						drawingEffect: "glossy",
						dataLabel: {
							visible: true
						}
					},
					legend: {
						isScrollable: true,
						title: {
							visible: false,
						},
						drawingEffect: "glossy"
					},
					legendGroup: {
						layout: {
							position: "bottom"
						}
					}
				});

				var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "size",
						'type': "Measure",
						'values': ["Deger"]
					}),
					feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "color",
						'type': "Dimension",
						'values': ["Statu"]
					});

				oVizFrame.addFeed(feedSize);
				oVizFrame.addFeed(feedColor);

			},

		});
	});