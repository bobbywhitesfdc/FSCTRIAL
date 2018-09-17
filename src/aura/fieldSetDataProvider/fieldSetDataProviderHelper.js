({
    getFields: function(component, event, helper) {
        var action = component.get("c.getFields");
        var typeName = component.get("v.sObjectName");
        var fsName = component.get("v.fieldSetName");
        var recordId = component.get("v.recordId");
        var recordType = component.get("v.recordType");
        var operationType = component.get("v.viewType");
        var self = this;

        action.setParams({
            typeName: typeName,
            fsName: fsName,
            recordTypes: recordType,
            recordId: recordId,
            operation: operationType,
            validateFieldSet: false
        });

        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var fields = response.getReturnValue();

                if (fields == null)
                    fields = [];
                //Looping each fieldsetmember and requrest custom label if any
                for (var index in fields) {
                    var field = fields[index];
                    field.label = self.convertLabel(field.label);
                }
                component.set("v.fields", fields);
                if (this.showLayout) {
                    this.showLayout(component, helper);
                }
            } else if (response.getState() === "ERROR") {
                this.fireErrorEvent(component, response);
            }
        });

        $A.enqueueAction(action);
    },

    getFieldValues: function(component, helper) {
        var fsName = component.get("v.fieldSetName");
        var action = component.get("c.getFieldValues");
        var typeName = component.get("v.sObjectName");
        var fields = component.get("v.fields");
        var fieldStr = fields.join(",");
        var self = this;
        action.setParams({
            typeName: typeName,
            fields: fieldStr
        });
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var fieldValues = response.getReturnValue();
                component.set("v.fieldValues", fieldValues);
                if (self.showLayout) {
                    self.showLayout(component, helper);
                }
            } else if (response.getState() === "ERROR") {
                this.fireErrorEvent(component, response);
            }
        });

        $A.enqueueAction(action);
    },
    isEventRelated: function(component, event) {
        var recordId = component.get("v.recordId");
        var records = component.get("v.records");
        var recordTypeId = (!$A.util.isEmpty(component.get("v.createButtonEventParam")) && !$A.util.isEmpty(component.get("v.createButtonEventParam").recordTypeId)) ? component.get("v.createButtonEventParam").recordTypeId : undefined;
        var sObjectName = component.get("v.sObjectName");
        if (/__c$/.test(sObjectName.toLowerCase())) {
            // Matches markup://<namespace> and extracts namespace
            var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
            prefix = prefix == "c" ? "" : prefix + "__";
            sObjectName = prefix + sObjectName;
        }
        var isFinancialGoal = sObjectName == prefix + 'FinancialGoal__c';


        //get record & id from event
        var eRecord = event.getParam("record");
        var eRecordId = event.getParam("recordId");
        var eRecordObjectType = (!$A.util.isEmpty(eRecord)) ? eRecord.sobjectType : null;
        //check to see if record is in list only on edit/edit
        if ($A.util.isEmpty(eRecord) && !$A.util.isEmpty(eRecordId) && $A.util.isEmpty(recordId) && !$A.util.isEmpty(records)) {
            for (var i = 0; i < records.length; i++) {
                if (records[i].Id === eRecordId) {
                    //change record type to one in list to force refresh
                    recordId = eRecordId;
                    break;
                }
            }
        }
        //check if record ID is the same, 
        //if no id is present, check if the record types are the same, 
        //if no record type present, check that is the same object
        //refresh on AccountContactRelation when Account matches recordId, will refresh on Groups & Business ACR changes
        //refresh on FinancialGoal__c when record IDs are different, meaning it's a delete operation on goals
        return ($A.util.isEmpty(component.get("v.viewType")) || component.get("v.viewType").toLowerCase() !== "edit") && (((!$A.util.isEmpty(eRecordId) && eRecordId === recordId) ||
            (!$A.util.isEmpty(eRecord) && ((eRecordObjectType === "AccountContactRelation" && eRecord.AccountId === component.get("v.recordId")) ||
                (!$A.util.isEmpty(recordTypeId) && eRecordObjectType === sObjectName && eRecord.RecordTypeId === recordTypeId) ||
                ($A.util.isEmpty(recordTypeId) && eRecordObjectType === sObjectName)))) || isFinancialGoal && recordId !== eRecordId);
    },
    convertLabel: function(label) {
        if (label != null && label.indexOf("$Label") == 0) {
            return $A.get(label);
        }
        return label;
    }
})