({
    onInit: function (component, event, helper) {
        var developerName = component.get("v.recordTypeDeveloperName");
        var prefix = '';
        if(component.get("v.namespacePrefix") == "Industries") {
            // Matches markup://<namespace> and extracts namespace
            var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        } else if(!$A.util.isEmpty(component.get("v.namespacePrefix"))) {
            prefix = component.get("v.namespacePrefix");
        }

        if (!$A.util.isEmpty(developerName)) {
            $A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": true
            }).fire();
            var action = component.get("c.getRecordTypeIdsBySObjectName");
            action.setParams({
                "sObjectName": component.get("v.sObjectName")
            });
            action.setCallback(this, function (response) {
                $A.get("e.force:toggleModalSpinner").setParams({
                    "isVisible": false
                }).fire();
                if (response.getState() === "SUCCESS") { 
                    var retObj = response.getReturnValue();
                    if(!$A.util.isEmpty(retObj[prefix+'__'+developerName])) {
                        component.set("v.recordTypeId", retObj[prefix+'__'+developerName]);
                    } else {
                        component.set("v.recordTypeId", retObj[developerName]);
                    }
                }   
            });
            $A.enqueueAction(action);
        }
    },
    createNewRecord: function (component, event, helper) {
        helper.createNewRecord(component);
    }
})