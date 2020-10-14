sap.ui.define(["sap/ui/core/UIComponent",
		"sap/ui/Device"
	],
	function (UIComponent, Device) { "use strict";

		return UIComponent.extend("urungiris.Component", {
			metadata: {
				manifest: "json",
				includes: ["./css/style.css"]
			},

			init: function () {

				UIComponent.prototype.init.apply(this, arguments);

				this.getRouter().initialize();

				var serviceUri = "/sap/opu/odata/sap/YESC_CKK_BIM_SRV"; 
				var oModel = new sap.ui.model.odata.ODataModel(serviceUri);
				oModel.setSizeLimit(1000);
				this.setModel(oModel);

			}
		});
	});