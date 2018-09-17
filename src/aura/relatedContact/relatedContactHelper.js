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
        var conDefaultObj = {};
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        var recordId = component.get("v.recordId");
        var objectInfo = component.get("v.objectInfo");
        var primaryContact = objectInfo.IsIndividual || objectInfo.IsHousehold ? objectInfo.PrimaryContact : recordId;
        conDefaultObj[prefix + "Contact__c"] = primaryContact;

        component.set("v.CCR_Param", {
            "entityApiName": prefix + "ContactContactRelation__c",
            "defaultFieldValues": conDefaultObj
        });
                //For Individual and Contact - ACR
        component.set("v.ACR_Param", {
            "entityApiName": "AccountContactRelation",
            "defaultFieldValues": {
                AccountId: recordId
            }
        });
    },
    /**
     * Handles refresh when AccountContactRelation is changed i.e. PrimaryMember of the Group is changed.
     * If PrimaryMember is changed the default selected contact on the CCR modal should be changed.
     **/
    onChange: function(component, event, helper) {
        var recordId = component.get("v.recordId");
        var eRecord = event.getParam("record");
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        var acrObject = "AccountContactRelation";
        var eRecordObjectType = (!$A.util.isEmpty(eRecord)) ? eRecord.sobjectType : null;
        if (!$A.util.isEmpty(eRecord) && (eRecord.Id === recordId || eRecordObjectType === acrObject)) {
            helper.getObjectInfo(component, event, helper);
        }
    }
})