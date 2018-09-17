({
    loadComponentParam: function(component, event, helper) {
        var entity = component.get("v.entity");
        var parentEntity = component.get("v.parentEntity");
        var showRelatedAccounts = component.get("v.showRelatedAccounts");
        var showRelatedContacts = component.get("v.showRelatedContacts");
        //If parentEntity is null, we are creating the root of the visualization tree.
        if (entity.isGroup) {
            actionTypes = ['membership'];
            component.set("v.createParam", {
                "recordTypeId": "",
                "recordTypeName": "",
                "groupName": component.get("v.entity.name"),
                "recordId" : component.get("v.entity.relId"),
                "editMode" : true,
                "showRelatedAccounts" : showRelatedAccounts,
                "showRelatedContacts" : showRelatedContacts
            });
        } else {
            //Set actionTypes for drop down menu.
            var entityBucketType = component.get("v.entity.bucketType");
            var actionTypes = ['standardButton'];
            var relatedAccountsACR = (parentEntity.isIndividual || parentEntity.isContact) && entityBucketType == 'RELATED_ACCOUNT';
            var relatedContactsACR = !parentEntity.isGroup && !parentEntity.isIndividual && !parentEntity.isContact && entityBucketType == 'RELATED_CONTACT';
            if (relatedAccountsACR || relatedContactsACR) {
                //Related Accounts/Related Contacts are ACR records.
                actionTypes = ['relationship'];
            }

            var parentAccountId = parentEntity.isGroup ? parentEntity.objId : '';
            var accDefaultObj = {};
            // Matches markup://<namespace> and extracts namespace
            var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
            prefix = prefix == "c" ? "" : prefix + "__";
            var primaryAccount = component.get("v.entity.primaryAccountId") ? component.get("v.entity.primaryAccountId") : "";
            if(component.get("v.parentEntity.isGroup")){
                accDefaultObj[prefix + "Account__c"] = parentAccountId;
            }
            else if(!$A.util.isEmpty(primaryAccount)){
                accDefaultObj[prefix + "Account__c"] = primaryAccount;
            }
            component.set("v.createAccountAccountRelation_Param", {
                "entityApiName": prefix + "AccountAccountRelation__c",
                "defaultFieldValues": accDefaultObj
            });

            var conDefaultObj = {};
            var primaryContact = component.get("v.entity.primaryContactId") ? component.get("v.entity.primaryContactId") : "";
            if(!$A.util.isEmpty(primaryContact)){
                conDefaultObj[prefix + "Contact__c"] = primaryContact;
            }

            component.set("v.createContactContactRelation_Param", {
                "entityApiName": prefix + "ContactContactRelation__c",
                "defaultFieldValues": conDefaultObj
            });
            component.set("v.createAccountContactRelation_Param_W_Con", {
                "entityApiName": "AccountContactRelation",
                "defaultFieldValues": {"ContactId" : primaryContact}
            });
            component.set("v.createAccountContactRelation_Param_W_Acc", {
                "entityApiName": "AccountContactRelation",
                "defaultFieldValues": {"AccountId" : primaryAccount}
            });
            
            if(parentEntity.isContact || parentEntity.isIndividual) {
                component.set("v.createGroupParam", {
                    "defaultRowValues": {
                        "ContactId": parentEntity.primaryContactId,
                        "Rollups__c": "",
                        "Primary__c": true,
                        "PrimaryGroup__c": false
                    },
                    "showRelatedAccounts" : showRelatedAccounts,
                    "showRelatedContacts" : showRelatedContacts
                });
            } else {
                component.set("v.createGroupParam", {
                    "defaultRowValues": {
                        "AccountId": parentEntity.objId,
                        "Rollups__c": "",
                        "IncludeInGroup__c": false
                    },
                    "showRelatedAccounts" : showRelatedAccounts,
                    "showRelatedContacts" : showRelatedContacts
                });
            }
        }
        component.set("v.actionTypes", actionTypes);
    }
})