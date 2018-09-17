({
    onInit: function (component, event, helper) {
        helper.getClientInfoAndRecordTypeIds(component);
        var recordTypeNames = component.get("v.recordTypeNames");
        var recordTypeNameList = helper.getListFromCommaSeparatedString(recordTypeNames);
        component.set("v.recordTypeNameList",recordTypeNameList);      
    },
        
    refresh: function(component, event, helper) {
        helper.setParamsForCreate(component);
    },
    onError: function(component, event, helper) {
        var response = event.getParam("error");
        if(response != null) {
            var responseErrors;
            // response.error is defined in case there is a custom error message due to validations
            if(typeof(response.error) == "undefined") {
                responseErrors = response[0]; 
            } else {
                responseErrors = response.error;
            }
            component.set("v.showErrors", true);
            component.set("v.errors", responseErrors);
            helper.toggleShowError(component);
        } else {
            helper.showErrorToast(component);
        }
    }
})