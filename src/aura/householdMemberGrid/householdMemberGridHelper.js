({
    doInit: function(component) {
		component.set("v.loading", true);
        var self = this;
        var fsName = component.get("v.fsName");
        var action = component.get("c.getFieldSet");
        var sObject = "Account";
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        action.setParams({
            "identifier": fsName,
            "sObjectName" : sObject
        });

        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var that = this;
                // add the aditional field set to the default fields
                var fieldsetString = self.getAllFields(response.getReturnValue(), 
                                        component.get("v.mandatoryFields")).join(",");
                var configuredFields = response.getReturnValue();
                // query for members of hh with given fieldset
                var getDataAction = component.get("c.getAllHouseholdMembers");
                getDataAction.setParams({
                    "identifier": component.get("v.recordId"),
                    "extraFieldsString": fieldsetString
                });

                component.set("v.records", []);
                getDataAction.setCallback(this, function(response) {                   
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        var result = response.getReturnValue();
                        var records = result.members
                        var _outResult = [];
                        
                        //loop through each object
                        for (var i = 0; i < records.length; i++) {
                            var objArr = [];
                            // Need this because lockerService blocks accessing currentRecord.recordFieldInfo directly
                            var currentRecord = JSON.parse(JSON.stringify(records[i]));
                            currentRecord.Id = records[i].acr.Id;
                            
                            //loop through the additional fields
                            for (var j = 0; j < configuredFields.length; j++) {
                                var meta = configuredFields[j];
                                if ($A.util.isEmpty(meta) || !meta.hasOwnProperty('fieldPath') || !meta.hasOwnProperty('type')) {
                                    $A.log("Error parsing Member Detail response: " + JSON.stringify(meta));
                                    continue;
                                }
                                
                                // Populates the record with information needed to render the fields
                                var rec = self.populateRecordInfo(meta, records[i].acr.Contact.Account);
                            
                                //add current field value of list
                                objArr.push(rec);
                            }
                            //add all field values to each object so we can loop through it
                            currentRecord.recordFieldInfo = objArr;
                            currentRecord.isPrimary = currentRecord.acr[prefix + "Primary__c"];
                            _outResult.push(currentRecord);

                        }

                        var householdId = result.account.Id;
                        component.set("v.householdId", householdId);
                        component.set("v.householdName", result.account.Name);
                        component.set("v.records", _outResult);
                        component.set("v.memberCount", records.length);
                        //set create params
                        var params = component.get("v.createParam");
                        params = ($A.util.isEmpty(params)) ? {} : params;
                        //if householdId is set, it is edit
                        params.recordId = householdId;
                        params.groupName = component.get("v.householdName");
                        params.editMode = (!$A.util.isEmpty(householdId));
                        component.set("v.createParam", params);
                    } else if (response.getState() === "ERROR") {
                        var errorEvent = component.getEvent("error");
                        errorEvent.setParams({
                            error: response
                        }).fire();
                    }
                    component.set("v.loading",false);                    
                });
                $A.enqueueAction(getDataAction);

            } else if (response.getState() === "ERROR") {
                var errorEvent = component.getEvent("error");
                errorEvent.setParams({
                    error: response
                }).fire();
                component.set("v.loading",false);
            }
        });      
        $A.enqueueAction(action);

    },
    getAllFields: function(additionalFields, allFields) {
        // add the aditional field set to the default fields
        for (var i = 0; i < additionalFields.length; i++) {
            var path = additionalFields[i].fieldPath;
            var type = additionalFields[i].type;
            var fieldName = "Contact.Account." + path;

            //make sure no fields are duplicated in the field set
            if (allFields.indexOf(fieldName) < 0) {
                allFields.push(fieldName);
            }
            // if there is a name field, query for Id as well
            if (path.slice(-5) == ".Name") {
                var newPath = path.replace(".Name", ""); 
                newPath = "Contact.Account." + newPath + ".Id";
                if (allFields.indexOf(newPath) < 0) {
                    allFields.push(newPath);
                }
            // if there is a reference field, query for Name as well
            } else if (type == "reference"){
                var newPath;
                // if custom reference field, replace __c with __r
                if (path.slice(-3) == "__c") {
                    newPath = path.slice(0, -3) + "__r";
                //if standard reference field, remove 'Id' e.g. AccountId becomes Account
                } else if (path.slice(-2) == "Id") {
                    newPath = path.slice(0, -2);
                }
                newPath = "Contact.Account." + newPath + '.Name';
                if (allFields.indexOf(newPath) < 0) {
                    allFields.push(newPath);
                }
            }
        }
        return allFields;
    },
    populateRecordInfo: function(meta, value) {
        var path = meta.fieldPath.split('.');
        // copy the object containing the field values
        var obj = value;
        var record = {};
            record.isContactField = false;
            // Mark fields as a Contact field
            if (meta.fieldPath.indexOf("PrimaryContact__r.") < 0) {
                record.isContactField = true;
        }
        for (var i = 0; i < path.length; i++) {
            // if object doesnt have the field, assign blank value and break
            if (!obj[path[i]]) {
                value = "";
                break;
            } 
            if (i === path.length - 1) {
                value = obj[path[i]];
            }
            // force name fields to be rendered as url
            if ((meta.fieldPath.slice(-5) == ".Name" || meta.fieldPath == "Name") && path[i] == "Name") {
                record.Id = obj["Id"];
                record.name = obj[path[i]];
                record.renderUrl = true;
                break;
            } else if (meta.type == "reference" && i === path.length - 1) {
                // force Id to be rendered as url with name
                record.Id = obj[path[i]];
                var newPath;
                if (path[i].slice(-3) == "__c") {
                    newPath = path[i].slice(0, -3) + "__r";
                } else if (path[i].slice(-2) == "Id"){
                    newPath = path[i].slice(0, -2);
                }
                record.name = obj[newPath]["Name"];
                record.renderUrl = true;
                break;
            } else {
                obj = obj[path[i]];
            }
        }

        record.APIName = meta.fieldPath;
        record.fieldName = meta.label;
        record.fieldValue = value;
        if (meta.fieldPath.slice(-5) == ".Name") {
            record.fieldType = "url";
        } else {
            record.fieldType = meta.type.toLowerCase();
        }
        return record;
    }
})