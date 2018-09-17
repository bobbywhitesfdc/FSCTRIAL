({
    getClientInfo: function(component) {
      
        var recordId = component.get("v.recordId");
        var clientInfoAction = component.get("c.getClientInfoByAccountID");
        clientInfoAction.setParams({
            "identifier": component.get("v.recordId")
        });
        // Makes a call out on RecordTypeController to fetch client information based on the account id
        clientInfoAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.accountInfo", response.getReturnValue());
                this.setFieldSetName(component);
                this.setAttributes(component);
            } else if (state === "ERROR") {
                component.set("v.showErrors", true);
                component.set("v.errors", response.getError());
                this.toggleShowError(component);
            }
        });
        $A.enqueueAction(clientInfoAction);
    },
    getClientInfoAndRecordTypeIds: function(component) {
        
        var self = this;
        // identifier is Account Id
        var action = component.get("c.getClientInfoAndRecordTypeIds");
        action.setParams({
            "sObjectNames": "FinancialAccount__c,FinancialAccountRole__c",
            "identifier": component.get("v.recordId")
        });

        action.setCallback(this, function(response) {
            $A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": false
            }).fire();
            if (response.getState() === "SUCCESS") {
                var results = response.getReturnValue();
                component.set("v.accountInfo", results.accountInfo);
                component.set("v.recordTypes", results.FinancialAccount__c);
                component.set("v.financialRoleRecordTypes", results.FinancialAccountRole__c);
                self.setFieldSetName(component);
                self.setParamsForCreate(component);
                self.setParamsForCreateFinancialRoles(component);
                self.setChildTable(component);
                self.setAttributes(component);
            } else if (response.getState() === "ERROR") {
                component.set("v.showErrors", true);
                component.set("v.errors", response.getError());
                self.toggleShowError(component);
            }
        });
        $A.enqueueAction(action);
    },
    setFieldSetName: function(component) {
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
            if (accountInfo.IsHousehold) {
                component.set("v.financialAccountFieldSet", component.get("v.householdFieldSet"));
            } else {
                component.set("v.financialAccountFieldSet", component.get("v.clientFieldSet"));
            }
        }
    },
    setParamsForCreate: function(component) {
        var primaryOwnerObj = {};

        var primaryOwner;
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
            //For Households, the Primary Owner of the FA should be empty if there is no Primary Account for the Household.
            if (accountInfo.IsHousehold) {
                primaryOwner = accountInfo.PrimaryAccount;
            } else {
                primaryOwner = accountInfo.PrimaryAccount ? accountInfo.PrimaryAccount : accountInfo.Id;
            }
        }

        var prefix = this.getPrefix(component);
        primaryOwnerObj[prefix + "PrimaryOwner__c"] = primaryOwner;
        var recordTypeName = component.get("v.recordTypeName");
        if($A.util.isEmpty(recordTypeName)) {
            var recordTypeNames = component.get("v.recordTypeNames");
            recordTypeName = $A.util.isArray(recordTypeNames) ? recordTypeNames[0] : recordTypeNames;
        }
        component.set("v.createParam", {
            "entityApiName": prefix + "FinancialAccount__c",
            "recordTypeId": component.get("v.recordTypes")[prefix + recordTypeName],
            "defaultFieldValues": primaryOwnerObj
        });
    },
    setParamsForCreateFinancialRoles: function(component) {
        var relatedAccObj = {};
        var primaryOwner = component.get("v.recordId") ? component.get("v.recordId") : "";

        var prefix = this.getPrefix(component);
        relatedAccObj[prefix + "RelatedAccount__c"] = primaryOwner;

        component.set("v.financialRoleCreateParam", {
            "entityApiName": prefix + "FinancialAccountRole__c",
            "recordTypeId": component.get("v.financialRoleRecordTypes")[prefix + "AccountRole"],
            "defaultFieldValues": relatedAccObj
        });
    },
    getPrefix: function(component) {
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        return prefix;
    },
    setChildTable: function(component) {
        //abstract method: leaving child component helper to implement if required
    },
    toggleShowError: function(component) {
        //abstract method: leaving child component helper to implement if required
    },
    //child component can overwrite it if the relationshipName is different
    setAttributes: function(component) {
        var accountInfo = component.get("v.accountInfo");
        if (!$A.util.isEmpty(accountInfo)) {
            if (accountInfo.IsHousehold) {
                component.set("v.relationshipName", "HouseholdFinancialAccounts__r");
            } else {
                component.set("v.relationshipName", "ClientFinancialAccounts__r");
            }
        }
    },
    // Get list from a comma separated string input
    getListFromCommaSeparatedString: function(commaSeparatedString) {
        var returnList = [];
        var commaSeparatedList = [];
        if(commaSeparatedString != null && commaSeparatedString.trim().length > 0) {
            commaSeparatedList = commaSeparatedString.split(',');
        }
        var j=0;
        for(var i =0; i < commaSeparatedList.length; i++) {
            if(commaSeparatedList[i].trim().length > 0) {
                returnList[j++] = commaSeparatedList[i].trim();
            }
           
        }
        return returnList;
    }
})