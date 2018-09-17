({
    init: function (component, event, helper) {
        helper.initializeParam(component, event, helper);
        helper.handleSelectionChanges(component);
    },
    handlePeriodSelection: function(component, event, helper) { // Month vs year vs etc
        if (event.getSource().isValid()) { 
            var menuItem = event.detail.menuItem;
            component.set("v.selectPeriod", menuItem.get("v.value"));
            component.set("v.selectPeriodLabel", menuItem.get("v.label"));
            helper.handleSelectionChanges(component, event, helper );
        }
    },
    handleFilterTypeSelection: function(component, event, helper) { // internal vs external
        if (event.getSource().isValid()) {
            helper.handleSelectionChanges(component, event, helper );
        }
    }
})