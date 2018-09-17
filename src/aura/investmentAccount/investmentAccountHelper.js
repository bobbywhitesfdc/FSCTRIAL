({
    setFieldSetName: function(component) {
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
            if (accountInfo.IsHousehold) {
                component.set("v.financialAccountFieldSet", component.get("v.householdFieldSet"));
                component.set("v.FinancialHoldingFieldset", "WM_Household_FinancialHolding");
            } else {
                component.set("v.financialAccountFieldSet", component.get("v.clientFieldSet"));
                component.set("v.FinancialHoldingFieldset", "WM_Client_FinancialHolding");
            }
        }
    },
    setChildTable: function(component) {
        var prefix = this.getPrefix(component);
        component.set("v.investmentAccountsChildTable", [{
            "sObjectName": "FinancialHolding__c",
            "childTableIndicator": prefix + "HoldingCount__c",
            "whereField": "FinancialAccount__c",
            "fieldSetName": component.get("v.FinancialHoldingFieldset")
        }]);
    },
    toggleShowError: function(component) {
        var finAccDataComponent = component.find("investmentAccountData");
        var errorComponent = component.find("errorMessage");

        $A.util.addClass(finAccDataComponent, "slds-hide")
        $A.util.removeClass(errorComponent, "slds-hide");
    }
})