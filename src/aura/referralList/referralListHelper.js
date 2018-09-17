({  
    populateCalculatedFields: function(component) {
        var newField = {
             dbRequired: false,
             defaultValue: "",
             disabled: false,
             errors: [],
             fieldPath: "ConvertedToNewClient",
             invalid: false,
             isFormula: false,
             isReadOnly: true,
             label: $A.get("$Label.FinServ.Label_New_Client"),
             picklistValues: [],
             referenceFieldValue: "",
             required: false,
             sObjectType: "",
             searchImplKey: "",
             searchPlaceholderTxt:"",
             type: "BOOLEAN",
             value: "",
             columnIndex: 1
         };

         var fieldList = Array();
         fieldList.push(newField);

         component.set("v.calculatedFields", fieldList);
    },

    getReferrerInfo: function(component) {
        var action = component.get("c.getReferrerInfo");
        var self = this;
        action.setParams({
            "recordID": component.get("v.recordId")
        });

        action.setCallback(this, function(response) {
            var state = response.getState();
            var defaultValues = {};

            if (state === "SUCCESS") {
                var prefix = self.getPrefix(component);
                var referrerInfo = response.getReturnValue();
                if(!$A.util.isEmpty(referrerInfo)) {
                    var recTypeId = referrerInfo['RecordTypeId'];
                    var referredByField = referrerInfo['Field'];
                    var referredById = referrerInfo['Id'];

                    component.set("v.referredById", referredById);
                    component.set("v.userProfile", (referredByField.toLowerCase() == 'referredbyuser__c'));
                    
                    if(!$A.util.isEmpty(referredById)){
                        defaultValues[prefix + referredByField] = referredById;
                    }
                    
                    component.set("v.createParam", {
                        "entityApiName": "Lead",
                        "recordTypeId": recTypeId,
                        "defaultFieldValues": defaultValues
                    });
                }
            } else if (state === "ERROR") {
                component.set("v.errors", response.getError());
                self.toggleShowError(component);
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