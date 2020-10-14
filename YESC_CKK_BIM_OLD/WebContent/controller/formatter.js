sap.ui.define([], function () {
	"use strict";
	return {

		deleteZeros: function (string) {
			return string.replace(/^0+/, '');
		},
		convertID: function (string) {
			return "Sevkiyat İade No: " + string.replace(/^0+/, '');
		},
		dosyaEditVisible: function (bool) {
			return false;
		},

		dosyaDeleteVisible: function (bool) {
			if (bool) {
				return true;
			} else {
				return false;
			}
		},
		menuIcon: function (number) {
			if (number === "0001") {
				return "sap-icon://crm-service-manager";
			} else if (number === "0002") {
				return "sap-icon://list";
			} else if (number === "0003") {
				return "sap-icon://pie-chart";
			}
		},

		dosyaUrl: function (id, matnr, charg, sirano) {

			var data = id + '__' + matnr + '__' + charg + '__' + sirano;
			return encodeURI("/sap/opu/odata/sap/YESC_CKK_BIM_SRV/UserPhotoSet('" + data + "')/$value");
		},

		fiyatVirgulDuzeltme: function (fiyat) {
			jQuery.sap.require("sap.ui.core.format.NumberFormat");
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 0,
				groupingEnabled: true,
				groupingSeparator: "",
				decimalSeparator: ","
			});

			return oNumberFormat.format(fiyat);
		},
		paketlemeVirgulDuzeltme: function (fiyat) {
			jQuery.sap.require("sap.ui.core.format.NumberFormat");
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 0,
				groupingEnabled: true,
				groupingSeparator: "",
				decimalSeparator: ","
			});

			return oNumberFormat.format(fiyat);
		},

	};
});