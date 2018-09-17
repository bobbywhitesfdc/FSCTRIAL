({
    onInit: function(component, event, helper) {
        helper.onInit(component, event, helper);
    },
    /**
     * Handles refresh when AccountContactRelation, AccountAccountRelation__c, ContactContactRelation__c changes or account/contact record id change.
     **/
    onChange: function(component, event, helper) {
        var recordId = component.get("v.recordId");
        var eRecord = event.getParam("record");
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        var acrObject = "AccountContactRelation";
        var aarObject = prefix + "AccountAccountRelation__c";
        var ccrObject = prefix + "ContactContactRelation__c";
        var eRecordObjectType = (!$A.util.isEmpty(eRecord)) ? eRecord.sobjectType : null;
        var relationshipObjectFlag = (eRecordObjectType === acrObject || eRecordObjectType === aarObject || eRecordObjectType === ccrObject);
        if (!$A.util.isEmpty(eRecord) && (eRecord.Id === recordId || relationshipObjectFlag)) {
            helper.onInit(component, event, helper);
        }
    }
})