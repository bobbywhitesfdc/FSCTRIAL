({
    /*
        getList preserves the SObject structure of a given SObject, and dumps the result directly into an array
    */
    getList: function(component) {
        $A.get("e.force:toggleModalSpinner").setParams({
            "isVisible": true
        }).fire();

        var action = component.get("c.getRecordsBySObject");
        var fields = component.get("v.fields");
        var self = this;
        action.setParams({
            "sObjectName": component.get("v.sObjectName"),
            "fieldset": component.get("v.fields").join(),
            "mapCriteria": component.get("v.filterCriteria"),
            "useOr": component.get("v.useOr"),
            "limitSize": component.get("v.limit"),
            "orderBy": component.get("v.orderBy"),
            "isOrderByDesc": component.get("v.isOrderByDesc")
        });
        action.setCallback(this, function(response) {
            $A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": false
            }).fire();

            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.sObjectList", response.getReturnValue());
            }

            var objectName = component.get("v.sObjectName");
        });
        $A.enqueueAction(action);
    },

    getAuraMetricLabel: function(componentName, functionName) {
         return componentName+':'+functionName;
    },

    getRecordCount: function(component) {
        var action = component.get("c.getRecordCountBySObject");
        action.setParams({
            "sObjectName": component.get("v.sObjectName"),
            "mapCriteria": component.get("v.filterCriteria"),
            "useOr": component.get("v.useOr")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            $A.log(response.getReturnValue());
            if (state === "SUCCESS") {
                component.set("v.recordCount", response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },
    /*
        getArrayList retrieves the given records from the SObjectName parameter, and puts all the fields in an array
    */
    getArrayList: function(component) {
        $A.get("e.force:toggleModalSpinner").setParams({
            "isVisible": true
        }).fire();

        var action = component.get("c.getObjectRecords");
        var fields = component.get("v.fields");
        var self = this;
        action.setParams({
            "sObjectName": component.get("v.sObjectName"),
            "fieldset": component.get("v.fields").join(),
            "filterCriteria": component.get("v.filterCriteria"),
            "limitSize": component.get("v.limit"),
            "orderBy": component.get("v.orderBy")
        });
        action.setCallback(this, function(response) {
            $A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": false
            }).fire();
            
            var state = response.getState();
            var mainArr = [];
            if (state === "SUCCESS") {
                var res = response.getReturnValue();
                //loop through each object
                for (var i = 0, resLength = res.length; i < resLength; i++) {
                    var objArr = [];
                    //loop through the given fields of the object
                    for (var j = 0, fieldsLength = fields.length; j < fieldsLength; j++) {
                        if (fields[j].indexOf('.') !== -1) {
                            //quick dirty test
                            var related = fields[j].split(".");
                            var value = res[i][related[0]][related[1]];
                        } else {
                            value = res[i][fields[j]];
                        }
                        //add current field value of list
                        objArr.push(value);
                    }
                    //add all field values to each object so we can loop through it
                    mainArr.push(objArr);
                }
            }
            //set to list of SObjects
            component.set("v.SObjectArray", mainArr);
        });
        $A.enqueueAction(action);
    }
})