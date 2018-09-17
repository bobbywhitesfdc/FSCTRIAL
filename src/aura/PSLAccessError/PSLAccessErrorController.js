({
    onInit: function(component, event, helper) {
        helper.createPlaceholder(component);
    },

    showError: function(component, event, helper) {
        var placeholderCmp = component.find("placeholder");
        $A.util.addClass(placeholderCmp, "slds-hide");
        //show error text
        $A.util.removeClass(component.find("noAccess"), "slds-hide");
    }
})