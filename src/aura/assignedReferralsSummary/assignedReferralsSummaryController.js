({
    onInit: function(component, event, helper) {
    	helper.initializeParam(component, event, helper);
        helper.getDetails(component, event, helper);
    },
    handlePeriodSelection: function(component, event, helper) {
    	if (event.getSource().isValid()) { 
            var menuItem = event.detail.menuItem;
            component.set("v.selectPeriod", menuItem.get("v.value"));
            component.set("v.selectPeriodLabel", menuItem.get("v.label"));
            helper.getDetails(component, event, helper);
        }
    }
})