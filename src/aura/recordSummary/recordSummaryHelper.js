({
    getFieldsHelper: function(component, event, helper) {
        helper.getFields(component, event, helper);
    },
    showLayout: function(component, helper) {
        var self = this;
        var fields = component.get("v.fields");
        var method = component.get("v.methodName");
        var action = component.get("c." + method);
        fields = self.parseFieldValues(fields);
        if (component.get("v.recordId")) {
            action.setParams({
                "recordID": component.get("v.recordId"),
                "whereField": "Id",
                "fields": fields.join(),
                "sObjectName": component.get("v.sObjectName")
            });
            $A.enqueueAction(action);
        }
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var records = response.getReturnValue();
                var rec = records[0];
                var metadata = component.get("v.fields");
                var mainArr = [];
                var objArr = [];
                //loop through the given fields of the object
                if(!$A.util.isEmpty(rec)) {
                    for (var j = 0, metadataLength = metadata.length; j < metadataLength; j++) {
                        var meta = metadata[j];
                        if ($A.util.isEmpty(meta) || !meta.hasOwnProperty('fieldPath') || !meta.hasOwnProperty('type')) {
                            $A.log("Error parsing recordSummary data: " 
                                    + JSON.stringify(meta) 
                                    + "\n param: \nr ecordID = " + component.get("v.recordId") 
                                    + "\n whereField = " + component.get("v.whereField") 
                                    + "\n fields = " + fields.join() 
                                    + "\n sObjectName = " + component.get("v.sObjectName"));
                            continue;
                        }
                        var field = {};
                        if (meta.fieldPath.indexOf('.') !== -1) {
                            //quick dirty test
                            var related = meta.fieldPath.split(".");
                            var value = rec[related[0]][related[1]];
                            field.Id = rec.Id;
                            field.APIName = meta.fieldPath;
                            field.fieldName = meta.label;
                            field.fieldType = meta.type.toLowerCase();
                            field.fieldValue = value;
                        } else {
                            if (meta.fieldPath == "Name") {
                                field.Name = rec.Name;
                                continue;
                            } else {
                                var value = rec[meta.fieldPath];
                                field.APIName = meta.fieldPath;
                                field.fieldName = meta.label;
                                field.fieldType = meta.type.toLowerCase();
                                field.fieldValue = value;
                            }
                        }
                        //add current field value of list
                        objArr.push(field);
                    }
                }
                //set to list of SObjects
                component.set("v.records", objArr);
            } else if (state === "ERROR") {
                this.fireErrorEvent(component, response);
            }
            self.showLoading(component, false);
        });
    },
    parseFieldLabels: function(fieldInfo) {
        var fieldLabels = [];
        for (var i = 0; i < fieldInfo.length; i++) {
            fieldLabels.push(fieldInfo[i].label);
        }
        return fieldLabels;
    },
    parseFieldValues: function(fieldInfo) {
        var fields = [];
        for (var i = 0; i < fieldInfo.length; i++) {
            fields.push(fieldInfo[i].fieldPath);
        }
        return fields;
    },
    isEventRelated: function(component, event) {
        //refresh in all cases
        var eRecord = event.getParam("record");
        var eRecordObjectType = (!$A.util.isEmpty(eRecord)) ? eRecord.sobjectType : null;
        //Refresh on AccountContactRelation when group is same, otherwise always refresh
        if(eRecordObjectType === "AccountContactRelation") {
            return (eRecord.AccountId === component.get("v.recordId"));
        } else {
            return true;
        }
    },
    showLoading: function(component, visible) {
        $A.util.toggleClass(component, "loading", !!visible);
    }
})