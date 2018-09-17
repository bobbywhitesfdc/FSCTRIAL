({
    initializeParam: function(component, event, helper) {
        var selectedOrderBy = component.get("v.selectOrderBy");
        var positionSettings = {
            "Revenue":  ["Made", "Converted", "Revenue"],
            "Made":     ["Converted", "Revenue", "Made"],
            "Converted":["Made", "Revenue", "Converted"]
        };
        var sortConfig = positionSettings[selectedOrderBy];

        var fieldSettings = {
            "Made": {
                "label":        $A.get("$Label.FinServ.Label_Referrers_Summary_Made_Amount"),
                "sortLabel":    $A.get("$Label.FinServ.Label_Referrers_Summary_Made"),
                "valueKey":     "Made",
                "isCurrency":   false,
                "shouldDisplay": true,
                "fieldType":    "number"
            },
            "Converted": {
                "label":        $A.get("$Label.FinServ.Label_Referrers_Summary_Converted_Amount"),
                "sortLabel":    $A.get("$Label.FinServ.Label_Referrers_Summary_Converted"),
                "valueKey":     "Converted",
                "isCurrency":   false,
                "shouldDisplay": true,
                "fieldType":    "number"
            }, 
            "Revenue": {
                "label":        $A.get("$Label.FinServ.Label_Referrers_Summary_Revenue_Amount"),
                "sortLabel":    $A.get("$Label.FinServ.Label_Referrers_Summary_Revenue"),
                "valueKey":     "Revenue",
                "isCurrency":   true,
                "shouldDisplay": component.get("v.displayRevenueFromReferrals"),
                "fieldType":    "currency"
            }
        };
        component.set("v.selectOrderByLabel", fieldSettings[selectedOrderBy].sortLabel);
        
        var colSettings = [];
        for (var i = 0; i < sortConfig.length; i ++) {
            var col = sortConfig[i];
            colSettings.push(fieldSettings[col]); 
        }
        //
        component.set("v.columnsConfig", colSettings);

        var typeOfReferrers = [{ "label": $A.get("$Label.FinServ.Label_Top_Referrers_Summary_Internal"), "value": "INTERNAL_ASSIGNED_TO_ME"},
                         { "label": $A.get("$Label.FinServ.Label_Top_Referrers_Summary_External"), "value": "EXTERNAL_ASSIGNED_TO_ME"}];
        component.set('v.typeOfReferrers', typeOfReferrers);
    },
    handleSelectionChanges: function(component, event, helper) {
        var self = this;
        var selection = component.get("v.selectPeriod") + component.get("v.selectFilterType");
        if (selection in component.get("v.data")) {
            component.set("v.topReferrersList", component.get("v.data")[selection]);
        } else {
            component.set("v.topReferrersList", []);
            var selectedOrderBy = component.get("v.selectOrderBy");
            var recordListAction = component.get("c.getTopReferrersSummary");
            recordListAction.setParams({ // logged in user, no need of passing recordId 
                "period"    : component.get("v.selectPeriod"),
                "orderBy"   : component.get("v.selectOrderBy"),
                "filterType": component.get("v.selectFilterType")
            });
            //
            component.set("v.loading", true);
            recordListAction.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var topReferrersList = response.getReturnValue();
                    var topList = [];
                    for(var i=0; i < topReferrersList.length; i++) {
                        var record = self.getColumns(component, topReferrersList[i]); 
                        record.Id = topReferrersList[i].Id;
                        record.Name = topReferrersList[i].Name;
                        topList.push(record);
                    }
                    var data = component.get("v.data");
                    data[selection] = topList;
                    component.set("v.data", data);
                    component.set("v.topReferrersList", topList);
                }
                component.set("v.loading", false);
            });
            $A.enqueueAction(recordListAction);
        }
    },
    getColumns: function(component, record) {
        var columns = JSON.parse(JSON.stringify(component.get("v.columnsConfig"))); //clone the default setting
        var index; //for locker service
        for (index in columns) {
            var valueKey = columns[index]["valueKey"];
            if (!$A.util.isEmpty(valueKey) && valueKey in record) {
                columns[index]["value"] = record[valueKey];
            }
            if( valueKey === "Revenue") {
                columns[index]["shouldDisplay"] = component.get("v.displayRevenueFromReferrals") && record["RevenueVisibility"];
            }
        }
        return {Columns: columns};
    }
})