({
    getValues: function(component) {
        $A.get("e.force:toggleModalSpinner").setParams({
            "isVisible": true
        }).fire();

        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";

        var self = this;
        var fields = component.get("v.fields");
        component.set("v.columnHeaders", self.parseFieldLabels(fields));
        var action = component.get("c.getRecordsById");
        fields = self.parseFieldValues(fields);
        action.setParams({
            "recordID": component.get("v.recordId"),
            "whereField": component.get("v.whereField"),
            "fields": fields.join(),
            "sObjectName": component.get("v.sObjectName")
        });
      
        action.setCallback(this, function(response) {
            $A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": false
            }).fire();

            var state = response.getState();
            if (state === "SUCCESS") {
                var res = response.getReturnValue();
                var records = res;
                var metadata = component.get("v.fields");
                var mainArr = [];
                var objArr = [];
                //loop through each object
                for (var i = 0, recordLength = records.length; i < recordLength; i++) {

                    objArr = [];
                    var currentRecord = {};
                    currentRecord.Id = records[i].Id;
                    //loop through the given fields of the object
                    for (var j = 0, metadataLength = metadata.length; j < metadataLength; j++) {
                        var meta = metadata[j];
                        if ($A.util.isEmpty(meta) || !meta.hasOwnProperty('fieldPath') || !meta.hasOwnProperty('type')) {
                            $A.log("Error parsing ListDataProvider response: " 
                                + JSON.stringify(meta) 
                                + "\n param: \n recordID = " + component.get("v.recordId") 
                                + "\n whereField = " + component.get("v.whereField") 
                                + "\n fields = " + fields.join() 
                                + "\n sObjectName = " + component.get("v.sObjectName"));
                            continue;
                        }
                        var record = {};
                        var fieldPath = (meta.fieldPath.lastIndexOf(prefix, 0) === 0) ? meta.fieldPath.replace(prefix, '') : meta.fieldPath;

                        if (fieldPath.indexOf('.') !== -1) {
                            //quick dirty test
                            var related = meta.fieldPath.split(".");
                            var value = records[i][related[0]][related[1]];
                            var key = fieldPath;
                            key = key.replace('.', '_');
                            record.APIName = fieldPath;
                            record.APINameKey = key;
                            record.fieldName = meta.label;
                            record.fieldType = meta.type.toLowerCase();
                            record.fieldValue = value;
                            currentRecord[key] = value;
                        } else {
                            if (fieldPath == "Name") {
                                currentRecord.Name = records[i].Name;
                                continue;
                            } else {
                                var value = records[i][meta.fieldPath];
                                record.APIName = fieldPath;
                                record.fieldName = meta.label;
                                record.fieldType = meta.type.toLowerCase();
                                record.fieldValue = value;
                                currentRecord[fieldPath] = value;
                            }
                        }
                        //add current field value of list
                        objArr.push(record);
                    }
                    //add all field values to each object so we can loop through it
                    currentRecord.recordFieldInfo = objArr;
                    mainArr.push(currentRecord);
                }
                //set to list of SObjects
                component.set("v.records", mainArr);
                component.set("v.queriedRecords",true);
            } else if (state === "ERROR") {
                this.fireErrorEvent(component, action);
            }
        });
        $A.enqueueAction(action);
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
    }
})