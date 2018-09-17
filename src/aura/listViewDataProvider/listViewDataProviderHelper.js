({
    provide: function(cmp, event) {
        var columns = cmp.get("v.columns");
        if($A.util.isEmpty(columns)) {
            return;
        }
      
        var method = cmp.get("v.methodName");
        var action = cmp.get("c." + method);
        columns = this.parseFieldValues(columns);
        
        var methodParams = cmp.get("v.methodParams");
        var defaultParams = {
            "recordID": cmp.get("v.recordId"),
            "whereField": cmp.get("v.whereField"),
            "fields": columns.join(),
            "sObjectName": cmp.get("v.sObjectName"),
            "recordTypeNames": cmp.get("v.recordTypeNames")
        };
        var actionParams = Object.assign({}, methodParams, defaultParams);
        action.setParams(actionParams);
        var self = this;
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var records = response.getReturnValue();
                //fire event
                cmp.set("v.totalItems", records.length);
                var pageSize = cmp.get("v.pageSize");
                // Take only pagesize number of records
                if (records.length > pageSize && pageSize > 0) {
                    cmp.set("v.items", records.slice(0,pageSize));
                } else {
                    cmp.set("v.items", records);
                }
                self.fireDataChangeEvent(cmp, cmp.get("v.items"), 1);
            } else if (response.getState() === "ERROR") {
                var errorEvent = cmp.getEvent("error");
                errorEvent.setParams({
                    error: response.getError()
                }).fire();
            }
        });
        $A.enqueueAction(action);
    },
    //copy paste from aura framework and remove setComponentEvent since locker service blocks it
    fireDataChangeEvent: function (dataProvider, data, currentPage) {
        var dataChangeEvent = dataProvider.getEvent("onchange");
        dataChangeEvent
            .setParams({
              data : data,
              currentPage : currentPage
           }).fire();
    },
    isEventRelated: function(cmp, event) {
        var recordId = cmp.get("v.recordId");
        var records = cmp.get("v.items");
        var sObjectName = cmp.get("v.sObjectName");
        // Matches markup://<namespace> and extracts namespace
        var prefix = cmp.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        if (/__c$/.test(sObjectName.toLowerCase())) {
            sObjectName = prefix + sObjectName;
        }

        //get record & id from event
        var eRecord = event.getParam("record");
        var eRecordId = event.getParam("recordId");
        var eRecordObjectType = (!$A.util.isEmpty(eRecord)) ? eRecord.sobjectType : null;
        //check to see if record is in list only on edit/delete
        if ($A.util.isEmpty(eRecord) && !$A.util.isEmpty(eRecordId) && !$A.util.isEmpty(records)) {
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
        //refresh on ContactContactRelation
        //always refresh FAR component when there is some change on FA
        var sameRecordId = (eRecordId === recordId);
        var entityApiName = event.getParam("entityApiName"); // Check the API name because eRecord is undefined in case of deletion
        var isFADeleted = (eRecord === undefined)  && (entityApiName === (prefix+"FinancialAccount__c")); // If FA was deleted
        var isCCR = (eRecordObjectType === "AccountContactRelation") && (sObjectName === (prefix + "ContactContactRelation__c"));
        var isACR = (eRecordObjectType === "AccountContactRelation") && (!$A.util.isEmpty(eRecord) ? (eRecord.AccountId === cmp.get("v.recordId")) : false);
        var isFA  = ((eRecordObjectType === (prefix+"FinancialAccount__c") || isFADeleted) && sObjectName == (prefix+"FinancialAccountRole__c"));  
        var isFHDeleted = (eRecord === undefined)  && (entityApiName === (prefix+"FinancialHolding__c")); // If a Financial Holding was deleted
        var isFH = ((eRecordObjectType === (prefix+"FinancialHolding__c") || isFHDeleted) && sObjectName == (prefix+"FinancialAccount__c"));  
        var sameObject = (eRecordObjectType === sObjectName);
        // check if record is deleted
        var isRecordDeleted = ((!$A.util.isEmpty(sObjectName)) && ($A.util.isEmpty(eRecordObjectType)) && ($A.util.isEmpty(eRecord)) && (!$A.util.isEmpty(eRecordId)));
        return sameRecordId || ((!$A.util.isEmpty(eRecord) || isFADeleted || isFHDeleted) && (isCCR || isACR || isFA || isFH || sameObject)) || isRecordDeleted;    
    },
    parseFieldValues: function(fieldInfo) {
        var fields = [];
        for (var i = 0; i < fieldInfo.length; i++) {
            fields.push(fieldInfo[i].fieldPath);
        }
        return fields;
    }
})