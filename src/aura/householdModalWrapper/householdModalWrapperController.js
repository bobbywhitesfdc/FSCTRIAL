({
    onInit: function(component, event, helper) {
        if ($A.util.isEmpty(component.get("v.groupRecordTypeId"))) {
            var action = component.get("c.getRecordTypeIdsBySObjectName");
            action.setParams({
                "sObjectName": "Account"
            });
            action.setCallback(this, function(response) {
                $A.get("e.force:toggleModalSpinner").setParams({
                    "isVisible": false
                }).fire();
                // Matches markup://<namespace> and extracts namespace
                var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
                var householdRecordType = prefix + "__" + component.get("v.householdRecordTypeName");
                if (response.getState() === "SUCCESS") {
                    if (householdRecordType in response.getReturnValue()) {
                        component.set("v.groupRecordTypeId", response.getReturnValue()[householdRecordType]);
                    }
                } else if (response.getState() === "ERROR") {
                    helper.showErrorToast(component, response);
                }
            });
            $A.enqueueAction(action);
        }
    },

    openModal: function openModal(component, event, helper) {
        // "navigationLocation":"RELATED_LIST" so it won't jump to the new record and refresh
        var groupRecordTypeId = component.get("v.groupRecordTypeId");
        if ($A.util.isEmpty(groupRecordTypeId)) {
            var createRecordEvent = $A.get("e.force:createRecordWithRecordTypeCheck");
            createRecordEvent.setParams({
                "entityApiName": "Account",
                "navigationLocation": "DETAIL"
            }).fire();
        } else {
            var createRecordEvent = $A.get("e.force:createRecord");
            createRecordEvent.setParams({
                "entityApiName": "Account",
                "recordTypeId": groupRecordTypeId,
                "navigationLocation": "DETAIL"
            }).fire();
        }
    }
})