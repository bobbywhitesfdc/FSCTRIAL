({
    snoozeAlert: function(component, event, helper) {
        var alertComponent = component.find("alertComponent");
        $A.util.addClass(alertComponent, "slds-hide");
    },
    closeAlert: function(component, event, helper) {
        var severity = component.get("v.severity");
        //fire modal if severity is not info
        if (severity !== "info") {
            helper.confirmClose(component);
        } 
        //otherwise, fire confirmation modal event directly
        else {
            $A.get("e.FinServ:confirmationModalEvent").setParams({
                attributes: {
                    recordId: component.get("v.recordId"),
                    componentId: component.getGlobalId()
                }
            }).fire();

        }
    }

})