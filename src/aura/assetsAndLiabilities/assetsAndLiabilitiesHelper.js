({
    setAttributes: function(component) {
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
            if (accountInfo.IsHousehold) {
                component.set("v.relationshipName", "HouseholdAssetsAndLiabilities__r");
            } else {
                component.set("v.relationshipName", "ClientAssetsAndLiabilities__r");
            }
        }
    },
    setFieldSetName: function(component) {
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
            if (accountInfo.IsHousehold) {
                component.set("v.assetAndLiabilityFieldset", component.get("v.householdFieldSet"));
            } else {
                component.set("v.assetAndLiabilityFieldset", component.get("v.clientFieldSet"));
            }
        }
    },
    setParamsForCreate: function(component) {
        var primaryOwnerObj = {};

        var primaryOwner;
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
            primaryOwner = accountInfo.PrimaryAccount ? accountInfo.PrimaryAccount : accountInfo.Id;
        }

        var prefix = this.getPrefix(component);
        primaryOwnerObj[prefix + "PrimaryOwner__c"] = primaryOwner;
        var recordTypeName = component.get("v.recordTypeName");
        component.set("v.createParam", {
            "entityApiName": prefix + "AssetsAndLiabilities__c",
            "defaultFieldValues": primaryOwnerObj
        });
    },
    toggleShowError: function(component) {
        var dataComponent = component.find("assetsAndLiabilitiesData");
        var errorComponent = component.find("errorMessage");

        $A.util.addClass(dataComponent, "slds-hide")
        $A.util.removeClass(errorComponent, "slds-hide");
    }
})