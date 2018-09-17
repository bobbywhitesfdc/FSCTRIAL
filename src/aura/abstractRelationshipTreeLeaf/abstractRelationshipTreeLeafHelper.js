({
    loadComponentParam: function(component, event, helper) {
        var actionTypes = ['membership'];
        var entity = component.get("v.entity");
        var parentEntity = component.get("v.parentEntity");
        //If parentEntity is null, we are creating the root of the visualization tree.
        if (!entity.isGroup) {
            //Set actionTypes for drop down menu.
            var entityBucketType = entity.bucketType;
            actionTypes = ['standardButton'];
            var relatedAccountsACR = (parentEntity.isIndividual || parentEntity.isContact) && entityBucketType == 'RELATED_ACCOUNT';
            var relatedContactsACR = !parentEntity.isGroup && !parentEntity.isIndividual && !parentEntity.isContact && entityBucketType == 'RELATED_CONTACT';

            if (relatedAccountsACR || relatedContactsACR) {
                //Related Accounts/Related Contacts are ACR records.
                actionTypes = ['relationship'];
            }
        }

        // call concrete component method to see if some other industry specific actionType is needed
        var industryActionTypes = helper.industrySpecificActionTypes(entity);
        if (!$A.util.isEmpty(industryActionTypes)){
            actionTypes = industryActionTypes;
        }
        component.set("v.actionTypes", actionTypes);
    }
})