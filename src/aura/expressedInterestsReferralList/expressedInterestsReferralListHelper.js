({  
    getReferrerInfo: function(component) {
        var action = component.get("c.getAccountInfoById");
        var self = this;
        action.setParams({
            "recordID": component.get("v.recordId")
        });

        action.setCallback(this, function(response) {
            var state = response.getState();
            var defaultValues = {};

            if (state === "SUCCESS") {
                var prefix = self.getPrefix(component);
                var accountInfo = response.getReturnValue();
                if(!$A.util.isEmpty(accountInfo)) {
                    var isIndividual = accountInfo['isIndividual'];
                    var isPersonAccount = accountInfo['isPersonAccount'];
                    component.set("v.isIndividual", isIndividual);
                    if(isIndividual) {
                    var recTypeId = accountInfo['RecordTypeId'];
                    var accountDetails = accountInfo['Account'];
                    var contactDetails = accountInfo['Contact'];
                    defaultValues['Street'] = accountDetails.BillingStreet;
                    defaultValues['City'] = accountDetails.BillingCity;
                    defaultValues['Country'] = accountDetails.BillingCountry;
                    defaultValues['PostalCode'] = accountDetails.BillingPostalCode;
                    defaultValues['State'] = accountDetails.BillingState;
                    defaultValues['FirstName'] = contactDetails.FirstName;
                    defaultValues['LastName'] = contactDetails.LastName;
                    defaultValues['Email'] = contactDetails.Email;
                    defaultValues['Fax'] = contactDetails.Fax;
                    defaultValues['Phone'] = contactDetails.Phone;
                    defaultValues['Title'] = contactDetails.Title;
                    if(!isPersonAccount) {
                       defaultValues['Company'] = accountDetails.Name;
                    }
                    var referredByField = "ReferredByUser__c";
                    var referredById = $A.get("$SObjectType.CurrentUser.Id");
                    
                    if(!$A.util.isEmpty(referredById)){
                        defaultValues[prefix + referredByField] = referredById;
                    }
                    var relatedAccount = "RelatedAccount__c";
                    defaultValues[prefix + relatedAccount] = component.get("v.recordId");
                    
                    component.set("v.createParam", {
                        "entityApiName": "Lead",
                        "recordTypeId": recTypeId,
                        "defaultFieldValues": defaultValues
                    }); 
                    } 
                } 
            } else if (state === "ERROR") {
                component.set("v.errors", response.getError());
                this.toggleShowError(component);
            }
        });

        $A.enqueueAction(action);
    },
    
    toggleShowError: function(component) {
        var dataComponent = component.find("referralsData");
        var errorComponent = component.find("errorMessage");

        $A.util.addClass(dataComponent, "slds-hide")
        $A.util.removeClass(errorComponent, "slds-hide");
    },
    getPrefix: function(component) {
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        return prefix;
    }
})