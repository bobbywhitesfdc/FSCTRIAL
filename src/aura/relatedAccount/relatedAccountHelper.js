({
    getObjectInfo: function(component, event, helper) {
        
        //These metriceService logs are for event monitoring.
        var recordId = component.get("v.recordId");
        var self = this;
        var action = component.get("c.getObjectInfo");
        action.setParams({
            "identifier": component.get("v.recordId")
        });
        // Makes a call out on RecordTypeController to fetch client information based on the account id
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var objectInfo = response.getReturnValue();
                // Set contactId attribute based on whether the account is Individual or Contact
                if(objectInfo.IsIndividual) {
                    component.set("v.contactId", objectInfo.PrimaryContact);
                } else if(objectInfo.IsContact) {
                    component.set("v.contactId", recordId);
                }
                component.set("v.objectInfo", objectInfo);
                helper.loadComponentParam(component, event, helper);
            } else if (state === "ERROR") {
                component.set("v.showErrors", true);
                component.set("v.errors", response.getError());
            }
        });
        $A.enqueueAction(action);
    },
    loadComponentParam: function(component, event, helper){
        var accDefaultObj = {};
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        var objectInfo = component.get("v.objectInfo");
        // For Business Accounts and Groups - AAR
        accDefaultObj[prefix + "Account__c"] = component.get("v.recordId");

        component.set("v.aarParams", {
            "entityApiName": prefix + "AccountAccountRelation__c",
            "defaultFieldValues": accDefaultObj
        });

        //For Individual and Contact - ACR
        component.set("v.acrParams", {
            "entityApiName": "AccountContactRelation",
            "defaultFieldValues": {
                ContactId: component.get("v.contactId")
            }
        });
    }
})