({
	toggleShowError: function(component) {
        var finAccDataComponent = component.find("insurancePolicyData");
        var errorComponent = component.find("errorMessage");

        $A.util.addClass(finAccDataComponent, "slds-hide")
        $A.util.removeClass(errorComponent, "slds-hide");
    }
})