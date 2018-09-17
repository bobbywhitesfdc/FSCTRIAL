({
    doInit: function(component, event, helper) {
        helper.createComponent(component);
    },
    onValueChange: function(component, event, helper) {
        helper.onValueChange(component, event, helper);
    },
    onOptionsChange: function(component, event, helper) {
        var fieldType = component.get("v.fieldType");
        if (!$A.util.isEmpty(fieldType) && fieldType.toLowerCase() == 'picklist') {
            helper.updatePicklistOptions(component, event, helper);
        }
    }
})