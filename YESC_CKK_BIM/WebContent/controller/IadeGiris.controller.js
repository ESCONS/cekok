sap.ui.define(
	["urungiris/controller/BaseController",
		"sap/m/MessageToast",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"urungiris/controller/formatter",
		"sap/m/MessageBox",
		"sap/ui/model/FilterType"
	],
	function (BaseController, MessageToast, Filter, FilterOperator, formatter, MessageBox, FilterType) {
		"use strict";

		return BaseController.extend("urungiris.controller.IadeGiris", {
			formatter: formatter,
			onInit: function (oEvent) {

				var oRouter = this.getRouter();
				oRouter.getRoute("iadeGiris").attachMatched(
					this._onRouteMatched,
					this);

			},

			_onRouteMatched: function (oEvent) {

				var oArgs = oEvent.getParameter("arguments");
				this.personelNo = oArgs.PersonelNo;
				this.type = oArgs.Type;

				this._kalem = {
					KalemList: []
				};
				this.jSONKalemModel = new sap.ui.model.json.JSONModel();

				var tblKalem = this.getView().byId("tblKalem");
				tblKalem.destroyItems();

				this.jSONKalemModel.setData(this._kalem);
				tblKalem.setModel(this.jSONKalemModel);

				var sServiceUrl = "/sap/opu/odata/SAP/YESC_CKK_BIM_SRV";
				this._oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

				this.inpMalzeme = "";
				this.ID = "";

				var that = this;
				this.getView().getModel().read("/GetNumberSet('X')", {
					success: function (oData) {
						that.ID = oData.EvId;
					},
					error: function () {
						that.getMessage("Error");
					}
				});

			},

			onPressIadeTamamla: function (oEvent) {

				var list = this._kalem.KalemList;

				var child = [];

				for (var i = 0; list.length > i; i++) {

					var nedenList = list[i].NedenList;

					for (var j = 0; nedenList.length > j; j++) {

						child.push({
							Id: this.ID,
							Matnr: list[i].Malzeme,
							Charg: list[i].Parti,
							Irsaliye: list[i].Irsaliye,
							ReturnStatu: "03",
							ReturnNumber: nedenList[j].ReturnNumber,
							Uname: this.personelNo,
							Datum: list[i].Tarih,
							BimValue: parseInt(nedenList[j].BIMValue).toString(), //parseInt(nedenList[j].BIMValue),
							Menge: list[i].Miktar.toString(), //parseFloat(list[i].Miktar)
							Description: list[i].Not
						});
					}
				}

				var headerSet = {};
				headerSet.Id = this.ID;
				headerSet.TamamlaItem = child;
				var that = this;

				var token;
				var url1 = "/sap/opu/odata/sap/YESC_CKK_BIM_SRV/TamamlaHeaderSet('" + this.ID + "')";
				var url2 = "/sap/opu/odata/sap/YESC_CKK_BIM_SRV/TamamlaHeaderSet";
				
				var oHeaders = {
					'X-Requested-With': 'XMLHttpRequest'
					// "X-CSRF-Token": "Fetch"
				};
				// var csrf = this.getView().getModel().getSecurityToken();
				$.ajax({
					type: 'POST',
					url: url2,
					contentType: "application/json",
					dataType: 'json',
					data: JSON.stringify(headerSet),
					async: true,
					headers:oHeaders,
					// headers: {
					// 	'X-CSRF-Token': csrf
					// },
					// beforeSend: function (xhr) {
					// 	xhr.setRequestHeader('X-CSRF-Token', csrf);
					// },
					success: function (data, textStatus, xhr) {

						that.getMessage("iadeGirisSucc");
						that.onNavBack();

						that._kalem.KalemList = [];
						that.jSONKalemModel.refresh();
					},
					error: function (e, xhr, textStatus, err, data) {

						that.getMessage("Error");
					}
				});

				//tokenlı yapmak lazım, kullanıcı göünce arkaya create yapmıyor

				// this.getView().getModel().create("TamamlaHeaderSet", headerSet, { 
				// 	asynchronous: false,
				// 	success: function (oData) {
				// 		that.getMessage("iadeGirisSucc"); 
				// 		that.onNavBack(); 
				// 		that._kalem.KalemList = [];
				// 		that.jSONKalemModel.refresh(); 
				// 	},
				// 	error: function (error) { 
				// 		that.getMessage("Error");
				// 	}
				// });

			},

			onPressIadeEkle: function (oEvent) {

				this._getIadeEkleDialog().open();

				this._dataModel = {
					MalzemeList: [],
				};
				this.jSONMainModel = new sap.ui.model.json.JSONModel();
				this.jSONMainModel.setData(this._dataModel);
				this.getView().setModel(this.jSONMainModel, "talep");

				//Clear işlemi yapılıyor
				sap.ui.getCore().byId("inpMalzeme").setValue("");
				sap.ui.getCore().byId("inpMiktar").setValue("");
				sap.ui.getCore().byId("inpParti").setValue("");
				sap.ui.getCore().byId("inpIrsaliye").setValue("");
				sap.ui.getCore().byId("dtEtiketTrh").setValue("");
				sap.ui.getCore().byId("txtANot").setValue("");

				var tblIadeNeden = sap.ui.getCore().byId("tblIadeNeden");

				tblIadeNeden.bindItems({
					path: "/GetIadeNedenSet",
					template: new sap.m.ColumnListItem({
						cells: [
							new sap.m.Text({
								text: "{ReturnText}"
							}), new sap.m.Input({
								value: "",
								type: "Number"
							})

						]
					})
				});

				var uploadCollection = sap.ui.getCore().byId("uploadCollection");
				uploadCollection.destroyItems();

			},

			onChange: function (oEvent) {

				var malzeme = sap.ui.getCore().byId("inpMalzeme").getValue();
				var parti = sap.ui.getCore().byId("inpParti").getValue();

				if (malzeme && parti) {

				} else {
					this.getMessage("DosyaSecimErr");
					oUploadCollection.fireUploadTerminated(sUploadedFile);
					return;
				}

				// var csrf = this.getView().getModel().getSecurityToken();
				var oUploadCollection = oEvent.getSource();
				var sUploadedFile = oEvent.getParameter('files')[0].name;

				oUploadCollection.removeAllHeaderParameters();
				// oUploadCollection.insertHeaderParameter(new sap.m.UploadCollectionParameter({
				// 	name: 'x-csrf-token',
				// 	value: csrf
				// }));
				oUploadCollection.insertHeaderParameter(new sap.m.UploadCollectionParameter({
					name: 'X-Requested-With',
					value: 'XMLHttpRequest'
				}));
				oUploadCollection.insertHeaderParameter(new sap.m.UploadCollectionParameter({
					name: 'Slug',
					value: sUploadedFile
				}));

				var check = /[ıüöçğşİÜÖÇĞŞ]/;
				var ifTurkish = check.test(sUploadedFile);
				if (ifTurkish) {
					this.getMessage("turkishCheck");
					oUploadCollection.fireUploadTerminated(sUploadedFile);
					return;
				}

				var extension = sUploadedFile.split('.')[1].toLowerCase();
				if (extension === 'jpg' || extension === 'pdf' || extension === 'csv' || extension === 'png') {

					var id = this.ID + "__" + malzeme + "__" + parti + '__' + sUploadedFile + "__" + this.type;
					var url = encodeURI("/sap/opu/odata/sap/YESC_CKK_BIM_SRV/UserSet('" + id + "')/Photo");
					oUploadCollection.setUploadUrl(url);

					this.getView().getModel().setProperty("/busy", true);
				} else {
					this.getMessage("dosyaSecimErr");
					oUploadCollection.setUploadUrl("");
					return;
				}

				// var oModel = this.getView().getModel();
				// oModel.refreshSecurityToken();
				// var oHeaders = oModel.oHeaders;
				// var sToken = oHeaders['x-csrf-token'];

				// var oUploadCollection = oEvent.getSource();
				// var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				// 	name: "x-csrf-token",
				// 	value: sToken
				// });
				// oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

				// var sUploadedFile = oEvent.getParameters().files[0].name;

				// var malzeme = sap.ui.getCore().byId("inpMalzeme").getValue();
				// var parti = sap.ui.getCore().byId("inpParti").getValue();

				// if (malzeme && parti) {

				// } else {
				// 	this.getMessage("DosyaSecimErr");
				// 	oUploadCollection.fireUploadTerminated(sUploadedFile);
				// 	return;
				// }

				// var check = /[ıüöçğşİÜÖÇĞŞ]/;
				// var ifTurkish = check.test(sUploadedFile);

				// if (ifTurkish) {
				// 	this.getMessage("turkishCheck");
				// 	oUploadCollection.fireUploadTerminated(sUploadedFile);
				// 	return;
				// }

				// var extension = sUploadedFile.split('.')[1].toLowerCase();
				// if (extension === 'jpg' || extension === 'pdf' || extension === 'csv' || extension === 'png') {

				// 	var mimetype = "";

				// 	// if (sUploadedFile.split('.')[1] === "jpg")
				// 	// 	mimetype = 'image__jpeg';
				// 	// else if (sUploadedFile.split('.')[1] === "pdf")
				// 	// 	mimetype = 'application__pdf';
				// 	// else if (sUploadedFile.split('.')[1] === "csv")
				// 	// 	mimetype = 'application__csv';
				// 	// else if (sUploadedFile.split('.')[1] === "png")
				// 	// 	mimetype = 'image__png';

				// 	var id = this.ID + "__" + malzeme + "__" + parti + '__' + sUploadedFile + "__" + this.type;

				// 	var url = encodeURI("/sap/opu/odata/sap/YESC_CKK_BIM_SRV/UserSet('" + id + "')/Photo");
				// 	oUploadCollection.setUploadUrl(url);

				// 	this.getView().getModel().setProperty("/busy", true);
				// } else {
				// 	this.getMessage("dosyaSecimErr");
				// 	oUploadCollection.setUploadUrl("");
				// 	return;
				// }

			},
			onBeforeUploadStarts: function (oEvent) {

				// var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				// 	name: "slug",
				// 	value: oEvent.getParameter("fileName")
				// });
				// oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

			},
			onUploadComplete: function (oEvent) {

				var uploadCollection = sap.ui.getCore().byId("uploadCollection");
				uploadCollection.destroyItems();

				var aFilter = [];

				aFilter.push(new Filter(
					"Id",
					FilterOperator.EQ,
					this.ID));

				var malzeme = sap.ui.getCore().byId("inpMalzeme").getValue();
				aFilter.push(new Filter(
					"Matnr",
					FilterOperator.EQ,
					malzeme));

				var parti = sap.ui.getCore().byId("inpParti").getValue();
				aFilter.push(new Filter(
					"Charg",
					FilterOperator.EQ,
					parti));

				aFilter.push(new Filter(
					"UserType",
					FilterOperator.EQ,
					this.type));

				uploadCollection.bindItems({
					path: "/GetFileListSet",
					template: new sap.m.UploadCollectionItem({
						fileName: "{Filename}",
						mimeType: "{Mimetype}",
						visibleEdit: {
							parts: [{
								path: "EditBtn"
							}],
							formatter: formatter.dosyaEditVisible
						},
						visibleDelete: {
							parts: [{
								path: "DelBtn"
							}],
							formatter: formatter.dosyaDeleteVisible
						},
						url: {
							parts: [{
									path: "Id"
								}, {
									path: "Matnr"
								}, {
									path: "Charg"
								}, {
									path: "Sirano"
								},

							],
							formatter: formatter.dosyaUrl
						}
					}),
					filters: aFilter
				});

			},
			onFileDeleted: function (oEvent) {

				var uploadCollection = sap.ui.getCore().byId("uploadCollection");
				var bindItem = sap.ui.getCore().byId(oEvent.getSource().sDeletedItemId).getBindingContext().getProperty();

				var malzeme = sap.ui.getCore().byId("inpMalzeme").getValue();
				var parti = sap.ui.getCore().byId("inpParti").getValue();
				var siraNo = bindItem.Sirano;

				var filename = bindItem.Filename;
				var url = encodeURI("/DeleteFileSet(IvId='" + this.ID + "',IvMatnr='" + malzeme + "',IvCharg='" + parti + "',IvSirano='" + siraNo +
					"')");

				var that = this;
				this.getView().getModel().read(url, {
					async: false,
					success: function (oData) {

						if (oData.EvMsgtype === "S") {
							uploadCollection.getBinding("items").refresh(true);
							that.getMessage("delFileSucc");
						} else {
							that.getMessage("delFileErr");
						}

					},
					error: function () {
						that.getMessage("Error");
					}
				});

			},

			onPressIadeEkleOK: function (oEvent) {

				var inpMalzeme = sap.ui.getCore().byId("inpMalzeme").getValue();
				if (!inpMalzeme) {
					this.getMessage("errMalzemeGir");
					return;
				}

				var inpMiktar = sap.ui.getCore().byId("inpMiktar").getValue();
				if (!inpMiktar) {
					this.getMessage("errMiktarGir");
					return;
				}

				var inpParti = sap.ui.getCore().byId("inpParti").getValue();
				if (!inpParti) {
					this.getMessage("errPartiGir");
					return;
				}

				var inpIrsaliye = sap.ui.getCore().byId("inpIrsaliye").getValue();
				if (!inpIrsaliye) {
					this.getMessage("errIrsaliyeGir");
					return;
				}

				var dtEtiketTrh = sap.ui.getCore().byId("dtEtiketTrh").getValue();
				if (!dtEtiketTrh) {
					this.getMessage("errTarihGir");
					return;
				}

				var txtANot = sap.ui.getCore().byId("txtANot").getValue();
				var tblIadeItems = sap.ui.getCore().byId("tblIadeNeden").getItems();
				var toplamMiktar = 0;

				var iadeList = [];

				for (var i = 0; tblIadeItems.length > i; i++) {

					var returnNumber = tblIadeItems[i].getBindingContext().getProperty().ReturnNumber;
					var mengeNew = tblIadeItems[i].getAggregation("cells")[1].getValue();

					if (mengeNew) {
						mengeNew = parseFloat(mengeNew.replace(",", "."));

						if (mengeNew < 0) {
							this.getMessage("sıfırdanBuyukGirErr");
							return;
						} else if (mengeNew > 100) {
							this.getMessage("max100Err");
							return;
						}
					} else {
						mengeNew = 0;
					}

					iadeList.push({
						ReturnNumber: returnNumber,
						BIMValue: mengeNew
					});

					toplamMiktar = toplamMiktar + mengeNew;
				}

				if (toplamMiktar === 0) {
					this.getMessage("yuzdeGirErr");
					return;
				}

				var that = this;
				this._kalem.KalemList.push({
					Malzeme: inpMalzeme,
					Miktar: inpMiktar,
					Parti: inpParti,
					Irsaliye: inpIrsaliye,
					Tarih: dtEtiketTrh,
					Not: txtANot,
					NedenList: iadeList
				});

				this.jSONKalemModel.refresh();

				this._getIadeEkleDialog().close();

			},

			onPressKalemSil: function (oEvent) {
				var deleteRecord = oEvent.getSource().getBindingContext().getObject();

				for (var i = 0; i < this._kalem.KalemList.length; i++) {

					if (this._kalem.KalemList[i] === deleteRecord) {

						this._kalem.KalemList.splice(i, 1);
						this.jSONKalemModel.refresh();
						break;
					}
				}
			},

			onPressIadeEkleCancel: function (oEvent) {

				this._getIadeEkleDialog().close();
			},

			_getIadeEkleDialog: function (oEvent) {
				if (!this._oIadeEkleDialog) {
					this._oIadeEkleDialog = sap.ui.xmlfragment("urungiris.view.IadeEkle", this);
					this.getView().addDependent(this._oIadeEkleDialog);
				}
				return this._oIadeEkleDialog;
			},

			//YATIRIM ALANI(İÇ SİPARİŞ)
			onVHRHMATNR: function (oEvent) {

				this.inpMalzeme = oEvent.getSource();

				var that = this;
				this._oModel.read("/GetMalzemeSet",
					null, null, false,
					function (oData, repsonse) {

						that._dataModel.MalzemeList = [];
						for (var i = 0; i < oData.results.length; i++) {

							var oResult = oData.results[i];
							that._dataModel.MalzemeList.push(oResult);
						}

					});

				this.jSONMainModel.refresh();

				this._getMATNRDialog().open();

			},

			_getMATNRDialog: function () {
				if (!this._oMATNR) {
					this._oMATNR = sap.ui.xmlfragment("urungiris.view.Malzeme", this);
					this.getView().addDependent(this._oMATNR);
				}
				return this._oMATNR;
			},

			_handleMATNRSearch: function (oEvent) {

				var sValue = oEvent.getParameter("value");
				var oFilters = [];

				oFilters.push(new Filter(
					"Matnr",
					FilterOperator.Contains,
					sValue));

				oFilters.push(new Filter(
					"Maktx",
					FilterOperator.Contains,
					sValue));

				this._setFilterVHR(oEvent.getSource().getBinding("items"), oFilters);

			},

			_handleMATNRClose: function (oEvent) {
				var oSelectedItem = oEvent.getParameter("selectedItem");

				if (oSelectedItem) {
					// this.inpMalzeme.setValue(oSelectedItem.getAggregation("cells")[0].getProperty("title"));
					this.inpMalzeme.setValue(oSelectedItem.getProperty("title"));
				} else {
					this.inpMalzeme.setValue("");
				}
			},

			_setFilterVHR: function (oBinding, oFilters) {
				oBinding.filter(new Filter({
					filters: oFilters,
					and: false,
				}), FilterType.Application);
			}

		});
	});