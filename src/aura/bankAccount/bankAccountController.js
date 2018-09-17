({
    onInit: function (component, event, helper) {
        helper.getClientInfoAndRecordTypeIds(component);
    },
    refresh: function(component, event, helper) {
        helper.setParamsForCreate(component);
    },
    onError: function(component, event, helper) {
        helper.showErrorToast(component);
    }
})