({
    onInit: function (component, event, helper) {
        helper.getClientInfoAndRecordTypeIds(component);
    },
    refresh: function(component, event, helper) {
        helper.setParamsForCreateFinancialRoles(component);
    },
    onError: function(component, event, helper) {
        helper.showErrorToast(component);
    }
})