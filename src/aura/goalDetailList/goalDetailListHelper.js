({
    getRecordInformation: function(component) {
        var recordId = component.get("v.recordId");
        var action = component.get("c.getClientInfoByAccountID");
        action.setParams({
            "identifier": recordId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var clientInfo = response.getReturnValue();
                if (clientInfo != null) {
                    //set the primary owner
                    if (clientInfo.IsIndividual || clientInfo.IsHousehold) {
                        var primaryOwner = clientInfo.PrimaryAccount;
                        var obj = {};
                        // Matches markup://<namespace> and extracts namespace
                        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
                        prefix = prefix == "c" ? "" : prefix + "__";
                        obj[prefix + "PrimaryOwner__c"] = primaryOwner;
                        component.set("v.defaultFieldValues", obj);
                    }
                    component.set("v.accountInfo", clientInfo);
                }
            } else if (state === "ERROR") {
                component.set("v.showErrors", true);
                component.set("v.errors", response.getError());
            }
        });
        $A.enqueueAction(action);
    }
})