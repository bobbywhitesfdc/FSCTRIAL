({
    onInit: function(component, event, helper) {
        helper.loadComponentParam(component, event, helper);
    },

    clickGroupShowHide: function(component, event, helper) {
        var elementsContainer = component.find("elementsContainer");
        var toggleHideButton = component.find("toggleHideButton");

        if ($A.util.hasClass(elementsContainer, "slds-hide")) {
            toggleHideButton.set("v.iconName", "utility:contract_alt");
        } else {
            toggleHideButton.set("v.iconName", "utility:expand_alt");
        }

        $A.util.toggleClass(elementsContainer, "slds-hide");
    }
})