({
	initializeParam: function(component, event, helper) {
        component.set("v.fieldConfig", [{
            "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_Received"), //the field label display on the UI
            "valueKey": "Made", //the backend value key map to each field
            "shouldDisplay": component.get("v.displayReferralsReceived"), //should display/hide this field
            "isNumber": true, //true if the value is a number, from FinServ:outputField
            "isCurrency": false, //true if the value is a currency, from FinServ:outputField
            "isPercentage": false, //true if the value is a percentage, from FinServ:outputField
            "fieldType": "number" //field type from FinServ:outputField
        }, {
            "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_Converted"),
            "valueKey": "Converted",
            "shouldDisplay": component.get("v.displayReferralsConverted"),
            "isNumber": true,
            "isCurrency": false,
            "isPercentage": false,
            "fieldType": "number"
        }, {
            "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_Rejected"),
            "valueKey": "Rejected",
            "shouldDisplay": component.get("v.displayReferralsRejected"),
            "isNumber": true,
            "isCurrency": false,
            "isPercentage": false,
            "fieldType": "number"
        }, {
            "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_Revenue"),
            "valueKey": "Revenue",
            "shouldDisplay": component.get("v.displayRevenueFromReferrals"),
            "isNumber": true,
            "isCurrency": true,
            "isPercentage": false,
            "fieldType": "currency"
        }, {
            "label": $A.get("$Label.FinServ.Label_Top_Expressed_Interest"),
            "valueKey": "TopExpressedInterest",
            "shouldDisplay": component.get("v.displayTopExpressedInterest"),
            "isNumber": false,
            "isCurrency": false,
            "isPercentage": false,
            "fieldType": "text"
        }, {
            "label": $A.get("$Label.FinServ.Label_Top_Referrer"),
            "valueKey": "TopReferrer",
            "shouldDisplay": component.get("v.displayTopReferrer"),
            "isNumber": false,
            "isCurrency": false,
            "isPercentage": false,
            "fieldType": "text"
        }, {
            "label": $A.get("$Label.FinServ.Label_Top_Referrer_Type"),
            "valueKey": "TopReferrerType",
            "shouldDisplay": component.get("v.displayTopReferrerType"),
            "isNumber": false,
            "isCurrency": false,
            "isPercentage": false,
            "fieldType": "text"
        }]);
    },
    getDetails: function(component, event, helper) {
        var selection = component.get("v.selectPeriod");
        if (selection in component.get("v.data")) {
            component.set("v.dataToDisplayInField", component.get("v.data")[selection]);
        } else {
            component.set("v.dataToDisplayInField", {});
            var action = component.get("c.getReferralsAssignedToMeSummary");
            action.setParams({ // logged in user, no need of passing recordId 
                "period"    : component.get("v.selectPeriod")
            });

            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var summary = response.getReturnValue();
                    helper.updateCache(component, helper, summary);
                    component.set("v.dataToDisplayInField", component.get("v.data")[selection]);
                }
            });
            $A.enqueueAction(action);
        }
    },
    updateCache: function(component, helper, value) {
    	var fieldData = JSON.parse(JSON.stringify(component.get("v.fieldConfig"))); //clone the default setting
        var index; 
        for (index in fieldData) {
            var valueKey = fieldData[index]["valueKey"];
            if (!$A.util.isEmpty(valueKey) && valueKey in value) {
                fieldData[index]["value"] = value[valueKey];
            }
            if( valueKey === "Revenue") {
                fieldData[index]["shouldDisplay"] = component.get("v.displayRevenueFromReferrals") && value["RevenueVisibility"];
            }
        }
        var data = component.get("v.data");
        data[component.get("v.selectPeriod")] = fieldData;
        component.set("v.data", data);
    }
})