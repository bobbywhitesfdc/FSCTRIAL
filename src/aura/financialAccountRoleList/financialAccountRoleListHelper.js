({
    setFieldSetName: function(component) {
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
                component.set("v.financialAccountFieldSet", component.get("v.faFieldSet"));
        }
    },
    toggleShowError: function(component) {
        var finAccDataComponent = component.find("finAccountData");
        var errorComponent = component.find("errorMessage");
        $A.util.addClass(finAccDataComponent, "slds-hide")
        $A.util.removeClass(errorComponent, "slds-hide");
    },
    
    setChildTable: function(component) {
        if(component.get("v.financialHoldingFieldSet") !=null) {
            var prefix = this.getPrefix(component);
            component.set("v.financialAccountChildTable", [{
                "sObjectName": "FinancialHolding__c",
                "childTableIndicator": prefix + "FinancialAccount__r."+prefix+"HoldingCount__c",
                "whereField": "FinancialAccount__c",
                "fieldSetName": component.get("v.financialHoldingFieldSet"),
                "recordId": prefix + "FinancialAccount__c",
                "recordName": prefix + "FinancialAccount__r"
            }]);
        }
    },
    
    setAttributes: function(component) {
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
            component.set("v.relationshipName", "FinancialAccountRoles__r");
        }
    }
    
})