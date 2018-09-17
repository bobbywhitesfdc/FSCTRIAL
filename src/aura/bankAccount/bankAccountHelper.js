({
	toggleShowError: function(component) {
        var dataComponent = component.find("bankAccountData");
        var errorComponent = component.find("errorMessage");

        $A.util.addClass(dataComponent, "slds-hide")
        $A.util.removeClass(errorComponent, "slds-hide");
    }
})