({
    //Utility function to create a panel(based on force:modal) given header component, body component & footer actions.
    createPanel: function(component, event) {
        var params = event.getParam('arguments');
        var panelAttributes = new Map();
		var componentAttributes = new Map();
        if (!$A.util.isEmpty(params.panelAttributes)) {
			panelAttributes = params.panelAttributes;
        }
		if (!$A.util.isEmpty(params.componentAttributes)) {
			componentAttributes = params.componentAttributes;
		}

        var compName = params.componentName;
        $A.createComponent(compName, componentAttributes, function(newCmp, status, statusMessage) {
            if (status == "SUCCESS") {
				var createBody = true;
                if (!$A.util.isUndefinedOrNull(panelAttributes["createBody"])) {
					createBody = panelAttributes["createBody"];
				}
                if (createBody) {
                    var title = newCmp.get("v.title");
                    var headerCmp = newCmp.find("header");
                    var bodyCmp = newCmp.find("body");
                    var footerCmp = newCmp.find("footer");
                    var footerActions = newCmp.get("v.footerActions");
                    var modalClass = newCmp.get("v.modalClass");
                    var closeOnActionButtonClick = newCmp.get("v.closeOnActionButtonClick");

                    var panelConfig = new Object();
                    if (!$A.util.isEmpty(modalClass)) {
                        panelConfig["class"] = modalClass;
                    }
                    if (!$A.util.isEmpty(headerCmp)) {
                        panelConfig["header"] = headerCmp;
                    } else if (!$A.util.isEmpty(title)) {
                        panelConfig["title"] = title;
                    }
                    panelConfig["body"] = bodyCmp;
                    if(!$A.util.isEmpty(footerCmp)) {
                        panelConfig["footer"] = footerCmp;
                    } else {
                        panelConfig["footerActions"] = footerActions;
                    }
                    if (!closeOnActionButtonClick) {
                        panelConfig["closeOnActionButtonClick"] = false;
                    }

                    $A.get("e.ui:createPanel").setParams({
                        panelType: "actionModal",
                        visible: true,
                        panelConfig: panelConfig,
                        onCreate: function(panel) {
                            newCmp.set("v.currentPanel", panel);
                        }
                    }).fire();
                }
            }
        });
    },
    
    showToast: function(component, event) {
        //from toasterLibrary/messages.js
        var name = event.getParam("name");
        var recordId = event.getParam("recordId");
        var isCreate = event.getParam("isCreate");

        var label = isCreate ? $A.get('$Label.MobileWebRecordActions.ToasterMessageCreate') : $A.get('$Label.MobileWebRecordActions.ToasterMessageUpdate');
        var entityLabel = $A.get("$Label.Global.Account");
        var message = label.replace("{0}", entityLabel);
        message = message.replace("{1}", name);
        message = message.replace(/  +/g, ' ');

        if(!isCreate) {
            //show account 
            $A.get("e.force:showToast").setParams({
                type: 'SUCCESS',
                mode: 'dismissible',
                message: message,
                messageTemplate: label,
                messageTemplateData: [entityLabel, name]
            }).fire();
        } else {
            var linkableAction  =  {
                executionComponent: {
                    type: 'SUCCESS',
                    descriptor: 'markup://force:navigateToSObject',
                    isEvent: true,
                    isClientSideCreatable: true,
                    componentName: 'navigateToSObject',
                    attributes: {
                        recordId: recordId,
                        slideDevName: 'detail'
                    }
                },
                label: name,
                title: name
            };

            $A.get("e.force:showToast").setParams({
                type: 'SUCCESS',
                mode: 'dismissible',
                message: message,
                duration: 10000,
                messageTemplate: label,
                messageTemplateData: [entityLabel, linkableAction]
            }).fire();
        }
    },
})