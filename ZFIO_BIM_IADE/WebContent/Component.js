jQuery.sap.declare("cus.PKT.BIMIADE.Component");
jQuery.sap.require("cus.PKT.BIMIADE.util.Util");
jQuery.sap.require("cus.PKT.BIMIADE.util.formatter");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.History");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
jQuery.sap.require("cus.PKT.BIMIADE.util.messages");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.core.UIComponent.extend("cus.PKT.BIMIADE.Component", {
    metadata: {
        "title": "CEKOK-BIM IADE Kokpit ",
        "version": "1.1.0-SNAPSHOT",
        "library": "cus.PKT.BIMIADE",
        "includes": ["css/fullScreenStyles.css", "util/Crypto.js"],
        "dependencies": {
            "libs": ["sap.m", "sap.ui.layout"],
            "components": []
        },
        "config": {
            resourceBundle: "i18n/i18n.properties",
            serviceConfig: {
                name: "", 
         serviceUrl: window.location.hostname == "localhost"?"proxy/http/185.4.210.237:8000/sap/opu/odata/sap/YESC_CKK_BIM_SRV/":"/sap/opu/odata/sap/YESC_CKK_BIM_SRV/"    
     //serviceUrl: window.location.hostname == "localhost"?"proxy/http/saptest.escons.com.tr:8000/sap/opu/odata/sap/YESC_CKK_BIM_SRV/":"/sap/opu/odata/sap/YESC_CKK_BIM_SRV/"    
        
                  }
        },
        routing: {
            // The default values for routes
            config: {
                "viewType": "XML",
                "viewPath": "cus.PKT.BIMIADE.view",
                "targetControl": "fioriContent",
                "targetAggregation": "pages",
                "clearTarget": false
            },
            routes: [{
                    name: "signup",
                    view: "SignUp",
                    pattern: "signup"
                },
                {
                    name: "changepassword",
                    view: "ChangePass",
                    pattern: "changepassword/User={Username}"
                },
                {
                    name: "login",
                    view: "SignUp",
                    pattern: ""
                },
                {
                    name: "mybills",
                    view: "MyBills",
                    pattern: "mybills/{userID}"
                },
            ]
        }
    },

    createContent: function() {
        var oViewData = {
            component: this
        };

        return sap.ui.view({
            viewName: "cus.PKT.BIMIADE.view.App",
            type: sap.ui.core.mvc.ViewType.XML,
            viewData: oViewData
        });
    },

    init: function() {
        sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

        this.i18nModelName = "i18n";
        this.viewElementModelName = "oViewElemProperties";
        var config = this.getMetadata().getConfig();
        var sRootPath = jQuery.sap.getModulePath("cus.PKT.BIMIADE");

        var oServiceConfig = config.serviceConfig;
        var sServiceUrl = oServiceConfig.serviceUrl;

        this._routeMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter(), this._bRouterCloseDialogs);

        this._initODataModel(sServiceUrl);
        this._initDeviceModel();

        var i18NModel = new sap.ui.model.resource.ResourceModel({
            bundleUrl: [sRootPath, config.resourceBundle].join("/")
        });
        this.setModel(i18NModel, this.i18nModelName);

        cus.PKT.BIMIADE.util.Util._setResourceBundle(i18NModel.getResourceBundle());

        this.setModel(this._createViewElementModel(), this.viewElementModelName);

        this.getRouter().initialize();
    },

    exit: function() {
        this._routeMatchedHandler.destroy();
    },

    // This method lets the app can decide if a navigation closes all open dialogs
    setRouterSetCloseDialogs: function(bCloseDialogs) {
        this._bRouterCloseDialogs = bCloseDialogs;
        if (this._routeMatchedHandler) {
            this._routeMatchedHandler.setCloseDialogs(bCloseDialogs);
        }
    },

    _initODataModel: function(sServiceUrl) {
        var oConfig = {
            metadataUrlParams: {},
            json: true,
            defaultBindingMode: "OneWay",
            //defaultCountMode: "Inline",
            //useBatch: true,
            loadMetadataAsync: false
        };
        var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, oConfig);
        oModel.attachRequestFailed(null, cus.PKT.BIMIADE.util.messages.showErrorMessage);
        this.setModel(oModel);
    },

    _createViewElementModel: function() {
        var oViewElemProperties = {};
        var oModel = new sap.ui.model.json.JSONModel(oViewElemProperties);
        oModel.setDefaultBindingMode("OneWay");
        return oModel;
    },

    _initDeviceModel: function() {
        var deviceModel = new sap.ui.model.json.JSONModel({
            isTouch: sap.ui.Device.support.touch,
            isNoTouch: !sap.ui.Device.support.touch,
            isPhone: sap.ui.Device.system.phone,
            isNoPhone: !sap.ui.Device.system.phone,
            listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
            listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
        });
        deviceModel.setDefaultBindingMode("OneWay");
        this.setModel(deviceModel, "device");
    }
});