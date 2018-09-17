({
    setFieldSetName: function(component) {
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)){
            if (accountInfo.IsHousehold) {
                component.set("v.FinancialAccountRoleFieldset", component.get("v.householdFieldSet"));
            } else {
                component.set("v.FinancialAccountRoleFieldset", component.get("v.clientFieldSet"));
            }
        }
    },
    setParamsForCreate: function(component) {},
    setAttributes: function(component) {
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
            component.set("v.relationshipName", "FinancialAccountRoles__r");
        }
    },
    toggleShowError: function(component) {
        var dataComponent = component.find("finAccountData");
        var errorComponent = component.find("errorMessage");

        $A.util.addClass(dataComponent, "slds-hide")
        $A.util.removeClass(errorComponent, "slds-hide");
    }
})