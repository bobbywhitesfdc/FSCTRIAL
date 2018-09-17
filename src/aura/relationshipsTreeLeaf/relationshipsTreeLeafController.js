({
    onInit: function(component, event, helper) {
        helper.loadComponentParam(component, event, helper);
    },
    
    clickGroupShowHide: function(component, event, helper) {
        component.set("v.expanded", !component.get("v.expanded"));
    }
})