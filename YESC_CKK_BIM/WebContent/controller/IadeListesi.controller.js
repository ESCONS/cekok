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

		return BaseController.extend("urungiris.controller.IadeListesi", {
			formatter: formatter,

			onInit: function (oEvent) {

				var oRouter = this.getRouter();
				oRouter.getRoute("iadeListesi").attachMatched(
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

				this.id = "";
				this.matnr = "";
				this.charg = "";
				this.returnStatu = "";
				this.uname = "";
				// this.sToken = "";

				//İade listi burada depo no göndererek bind edeceksin
				var lstIadeBaslik = this.getView().byId("lstIadeBaslik");

				if (this.type === "C" || this.type === "A")
					this.getView().byId("uplCollList").setUploadButtonInvisible(false);
				else if (this.type === "B")
					this.getView().byId("uplCollList").setUploadButtonInvisible(true);

				var aFilter = [];

				for (var i = 0; array.Kullanici.length > i; i++) {
					aFilter.push(new Filter(
						"Uname",
						FilterOperator.EQ,
						array.Kullanici[i]));
				}

				aFilter.push(new Filter(
					"Type",
					FilterOperator.EQ,
					this.type));

				aFilter.push(new Filter(
					"BasTrh",
					FilterOperator.EQ,
					this.basTrh));

				aFilter.push(new Filter(
					"BtsTrh",
					FilterOperator.EQ,
					this.btsTrh));

				var that = this;
				lstIadeBaslik.bindItems({
					path: "/GetIadeListSet",
					template: new sap.m.StandardListItem({
						title: {
							parts: [{
								path: "Id"
							}],
							formatter: formatter.convertID
						},
						description: "{BimErdat} - {BimErzet}",
						info: "{Uname}",
						type: "Navigation",
						press: function (oEvent) {
							that.onPressToDetail(oEvent);
						}
					}),
					filters: aFilter
				});

			},

			onPressToDetail: function (oEvent) {

				var value = oEvent.getSource().getBindingContext().getProperty();

				var sToPageId = "detail";
				this.getSplitContObj().toDetail(this.createId(sToPageId));

				//Header bilgileri
				this.getView().byId("objHdrId").setTitle("Sevkiyat İade No: " + value.Id.replace(/^0+/, ''));
				this.getView().byId("oAttUname").setText("Kullanıcı: " + value.Uname );
				this.getView().byId("oAttTime").setText(value.BimErdat + "-" + value.BimErzet);

				var tblIadeKalem = this.getView().byId("tblIadeKalem");

				var oFilter = new Filter(
					"Id",
					FilterOperator.EQ,
					value.Id);

				var that = this;
				tblIadeKalem.bindItems({
					path: "/GetIadeKalemSet",
					template: new sap.m.ColumnListItem({
						cells: [
							new sap.m.ObjectIdentifier({
								title: "{Matnr}"
									// text: "{Maktx}"
							}),
							new sap.m.Text({
								text: "{Charg}"
							}),
							new sap.m.Text({
								text: "{Datum}"
							}),
							new sap.m.Text({
								text: {
									parts: [{
										path: "Menge"
									}],
									formatter: formatter.fiyatVirgulDuzeltme
								}
							}),
							new sap.ui.core.Icon({
								src: {
									parts: [{
										path: "ReturnStatu"
									}],
									formatter: formatter.lineIcon
								},
								color: {
									parts: [{
										path: "ReturnStatu"
									}],
									formatter: formatter.lineIconColor
								},
								size: {
									parts: [{
										path: "ReturnStatu"
									}],
									formatter: formatter.lineIconSize
								}
							}),

						],
						type: "Navigation",
						press: function (oEvent) {
							that.onPressDetailToDetail(oEvent);
						}
					}),
					filters: oFilter,
					events: {
						// dataReceived: function (oEvent) {

						// 	// seçilmemişler boyalı gelsin belli olsun
						// 	var items = that.getView().byId("tblIadeKalem").getItems();

						// 	//Statüye göre renklendirme var.
						// 	for (var i = 0; items.length > i; i++) {
						// 		var object = items[i].getBindingContext().getProperty();

						// 		if (object.ReturnStatu === "01") {
						// 			items[i].addStyleClass("cssGreen");
						// 		} else if (object.ReturnStatu === "02") {
						// 			items[i].addStyleClass("cssRed");
						// 		} else if (object.ReturnStatu === "03") {
						// 			items[i].addStyleClass("cssWhite");
						// 		}

						// 	}

						// }
					}
				});

			},

			onPressDetailToDetail: function (oEvent) {
				this.id = oEvent.getSource().getBindingContext().getProperty().Id;
				this.matnr = oEvent.getSource().getBindingContext().getProperty().Matnr;
				this.charg = oEvent.getSource().getBindingContext().getProperty().Charg;
				this.returnStatu = oEvent.getSource().getBindingContext().getProperty().ReturnStatu;
				this.uname = oEvent.getSource().getBindingContext().getProperty().Uname;

				var aFilters = [];
				aFilters.push(new Filter(
					"Id",
					FilterOperator.EQ,
					this.id));

				aFilters.push(new Filter(
					"Matnr",
					FilterOperator.EQ,
					this.matnr));

				aFilters.push(new Filter(
					"Charg",
					FilterOperator.EQ,
					this.charg));

				aFilters.push(new Filter(
					"ReturnStatu",
					FilterOperator.EQ,
					this.returnStatu));

				aFilters.push(new Filter(
					"Uname",
					FilterOperator.EQ,
					this.uname));

				var tblIadeNeden = this.getView().byId("tblIadeNeden");

				var txtABIMNot = this.getView().byId("txtABIMNot");
				var txtACekokNot = this.getView().byId("txtACekokNot");

				txtABIMNot.setEnabled(false);
				txtACekokNot.setEnabled(false);

				this.getView().byId("slctNeden").setSelectedKey(this.returnStatu);
				this.getView().byId("slctNeden").setEnabled(false);
				this.getView().byId("btnKaydet").setVisible(false);

				var ckkValueStatu = false;
				if (this.type === "C" || this.type === "A") {
					ckkValueStatu = true;
					txtACekokNot.setEnabled(true);
					this.getView().byId("slctNeden").setEnabled(true);
					this.getView().byId("btnKaydet").setVisible(true);
				}

				var that = this;
				tblIadeNeden.bindItems({
					path: "/GetIadeNedenSncSet",
					template: new sap.m.ColumnListItem({
						cells: [
							new sap.m.Text({
								text: "{ReturnText}"
							}),
							new sap.m.Input({
								value: {
									parts: [{
										path: "BimValue"
									}],
									formatter: formatter.deleteZeros
								}
							}),
							new sap.m.Input({
								value: {
									parts: [{
										path: "CkkValue"
									}],
									formatter: formatter.deleteZeros
								},
								type: "Number"
							})

						]
					}),
					filters: aFilters,
					events: {
						dataReceived: function (oEvent) {

							//seçilmemişler boyalı gelsin belli olsun
							var items = that.getView().byId("tblIadeNeden").getItems();

							//Statüye göre renklendirme var.
							for (var i = 0; items.length > i; i++) {

								txtABIMNot.setValue(items[i].getBindingContext().getProperty().Description);
								txtACekokNot.setValue(items[i].getBindingContext().getProperty().Description2);

								items[i].getAggregation("cells")[1].setEnabled(false); //bim
							
								if (that.type === "C" || that.type === "A")
									items[i].getAggregation("cells")[2].setEnabled(true); //cekok
								else
									items[i].getAggregation("cells")[2].setEnabled(false); //cekok

							}

						}
					}
				});

				var uploadCollection = this.getView().byId("uplCollList");
				uploadCollection.destroyItems();

				var aFilter = [];

				aFilter.push(new Filter(
					"Id",
					FilterOperator.EQ,
					this.id));

				aFilter.push(new Filter(
					"Matnr",
					FilterOperator.EQ,
					this.matnr));

				aFilter.push(new Filter(
					"Charg",
					FilterOperator.EQ,
					this.charg));

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

				this.getSplitContObj().to(this.createId("detailDetail"));
			},

			onChange: function (oEvent) {

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

					var id = this.id + "__" + this.matnr + "__" + this.charg + '__' + sUploadedFile + "__" + this.type;
					var url = encodeURI("/sap/opu/odata/sap/YESC_CKK_BIM_SRV/UserSet('" + id + "')/Photo");
					oUploadCollection.setUploadUrl(url);

					this.getView().getModel().setProperty("/busy", true);
				} else {
					this.getMessage("dosyaSecimErr");
					oUploadCollection.setUploadUrl("");
					return;
				}

			},
			onBeforeUploadStarts: function (oEvent) {

			},
			onUploadComplete: function (oEvent) {

				var uploadCollection = this.getView().byId("uplCollList");
				uploadCollection.getBinding("items").refresh(true);
			},
			onFileDeleted: function (oEvent) {

				var uploadCollection = this.getView().byId("uplCollList");
				var bindItem = sap.ui.getCore().byId(oEvent.getSource().sDeletedItemId).getBindingContext().getProperty();

				var siraNo = bindItem.Sirano;

				var filename = bindItem.Filename;
				var url = encodeURI("/DeleteFileSet(IvId='" + this.id + "',IvMatnr='" + this.matnr + "',IvCharg='" + this.charg + "',IvSirano='" +
					siraNo +
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

			onPressCekokKaydet: function () {

				var child = [];

				var tblIadeNeden = this.getView().byId("tblIadeNeden").getItems();
				var txtACekokNot = this.getView().byId("txtACekokNot").getValue();
				var slctNeden = this.getView().byId("slctNeden").getSelectedKey();

				var toplamMiktar = 0;
				for (var i = 0; tblIadeNeden.length > i; i++) {

					var object = tblIadeNeden[i].getBindingContext().getProperty();
					var ckkValue = tblIadeNeden[i].getAggregation("cells")[2].getProperty("value");

					if (ckkValue) {
						ckkValue = parseFloat(ckkValue.replace(",", "."));

						if (ckkValue < 0) {
							this.getMessage("sıfırdanBuyukGirErr");
							return;
						} else if (ckkValue > 100) {
							this.getMessage("max100Err");
							return;
						}
					} else {
						ckkValue = 0;
					}

					toplamMiktar = toplamMiktar + ckkValue;

					child.push({
						Id: this.id,
						Matnr: this.matnr.replace(/^0+/, ''),
						Charg: this.charg,
						ReturnStatu: slctNeden,
						ReturnNumber: object.ReturnNumber,
						Uname: this.uname,
						CkkValue: parseInt(ckkValue).toString(),
						Description2: txtACekokNot
					});
				}

				if (toplamMiktar === 0) {
					this.getMessage("yuzdeGirErr");
					return;
				}

				var headerSet = {};
				headerSet.Id = this.id;
				headerSet.CkkKaydetItem = child;

				// 
				// var that = this;
				// this.getView().getModel().setHeaders({
				// 	"X-Requested-With": "X",
				// 	"X-CSRF-Token": "Fetch"
				// });;
				// 
				// this.getView().getModel().create("CkkKaydetHdrSet", headerSet, {
				// 	asynchronous: false,
				// 	success: function (oData) {
				// 		that.getView().byId("tblIadeKalem").getBinding("items").refresh(true);

				// 		//seçilmemişler boyalı gelsin belli olsun

				// 		var items = that.getView().byId("tblIadeKalem").getItems();

				// 		//Statüye göre renklendirme var.
				// 		for (var i = 0; items.length > i; i++) {

				// 			var item = items[i].getBindingContext().getProperty();

				// 			if (item.Matnr === that.matnr && item.Charg === that.charg && item.Uname === that.uname) {
				// 				if (slctNeden === "01")
				// 					items[i].addStyleClass("cssGreen");
				// 				else if (slctNeden === "02")
				// 					items[i].addStyleClass("cssRed");
				// 				else if (slctNeden === "03")
				// 					items[i].addStyleClass("cssWhite");

				// 			}
				// 		}

				// 		that.getMessage("guncellOk");
				// 		that.onPressDetailBack();

				// 	},
				// 	error: function (error) {

				// 		that.getMessage("Error");
				// 	}
				// });
				
				
				var that = this;
				var url1 = "/sap/opu/odata/sap/YESC_CKK_BIM_SRV/CkkKaydetHdrSet('" + this.id + "')";
				var url2 = "/sap/opu/odata/sap/YESC_CKK_BIM_SRV/CkkKaydetHdrSet";
					
				
				// var csrf = this.getView().getModel().getSecurityToken();
				var oHeaders = {
					'X-Requested-With': 'XMLHttpRequest'
					// "X-CSRF-Token": "Fetch"
				};

				$.ajax({
					type: 'POST',
					url: url2,
					contentType: "application/json",
					dataType: 'json',
					data: JSON.stringify(headerSet),
					async: true,
					headers: oHeaders,
					// headers: {
					// 	'X-CSRF-Token': csrf
					// },
					// beforeSend: function (xhr) {
					// 	xhr.setRequestHeader(oHeaders);
					// },
					success: function (oData, textStatus, xhr) {
						
						//seçilmemişler boyalı gelsin belli olsun
						// var items = that.getView().byId("tblIadeKalem").getItems();

						// //Statüye göre renklendirme var.
						// for (var i = 0; items.length > i; i++) {

						// 	var item = items[i].getBindingContext().getProperty();

						// 	if (item.Matnr === that.matnr && item.Charg === that.charg && item.Uname === that.uname) {
						// 		if (slctNeden === "01")
						// 			items[i].addStyleClass("cssGreen");
						// 		else if (slctNeden === "02")
						// 			items[i].addStyleClass("cssRed");
						// 		else if (slctNeden === "03")
						// 			items[i].addStyleClass("cssWhite");
						// 	}
						// }

						that.getView().byId("tblIadeKalem").getBinding("items").refresh(true);
						that.getMessage("guncellOk");
						that.onPressDetailBack();

					},
					error: function (e, xhr, textStatus, err, data) {
						
						that.getMessage("Error");
					}
				});

			},

			onPressMasterBack: function () {
				this.getSplitContObj().backMaster();
			},

			onPressNavToDetail: function () {
				this.getSplitContObj().to(this.createId("detailDetail"));
			},

			onPressDetailBack: function () {
				this.getSplitContObj().backDetail();
			},

			getSplitContObj: function () {
				var result = this.byId("SplitContDemo");
				if (!result) {
					jQuery.sap.log.error("SplitApp object can't be found");
				}
				return result;
			},
			onAfterRendering: function () {
				var oSplitCont = this.getSplitContObj(),
					ref = oSplitCont.getDomRef() && oSplitCont.getDomRef().parentNode;

				// set all parent elements to 100% height, this should be done by app developer, but just in case
				if (ref && !ref._sapUI5HeightFixed) {
					ref._sapUI5HeightFixed = true;
					while (ref && ref !== document.documentElement) {
						var $ref = jQuery(ref);
						if ($ref.attr("data-sap-ui-root-content")) { // Shell as parent does this already
							break;
						}
						if (!ref.style.height) {
							ref.style.height = "100%";
						}
						ref = ref.parentNode;
					}
				}
			},

		});
	});