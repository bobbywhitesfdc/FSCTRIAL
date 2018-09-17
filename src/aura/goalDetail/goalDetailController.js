({
    onInit: function(component, event, helper) {
    	
        helper.getFields(component, helper);
    },
    getValues: function(component, event, helper) {
        helper.getValues(component);
    },
    onError : function(component, response, helper) {
		helper.showErrorToast(component);
    }
})