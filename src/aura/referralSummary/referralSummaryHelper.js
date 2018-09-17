({
    initializeParam: function(component, event, helper) {
        component.set("v.fieldConfig", [{
            "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_Referrals"), //the field label display on the UI
            "valueKey": "Made", //the backend value key map to each field
            "shouldDisplay": component.get("v.displayReferralsMade"), //should display/hide this field
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
            "isNumber": false,
            "isCurrency": true,
            "isPercentage": false,
            "fieldType": "currency"
        }, {
            "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_Membership"),
            "valueKey": "HHPenetration",
            "shouldDisplay": component.get("v.displayReferralsHHPenetration"),
            "isNumber": true,
            "isCurrency": false,
            "isPercentage": false,
            "fieldType": "number"
        }, {
            "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_Average_Conversion_Rate"),
            "tooltip": $A.get("$Label.FinServ.Msg_Help_Average_Conversion_Rate"),
            "valueKey": "AvgConversionRate",
            "shouldDisplay": component.get("v.displayAverageConversionRate"),
            "isNumber": true,
            "isCurrency": false,
            "isPercentage": true,
            "fieldType": "percent"
        }]);

        var periodKeys = [{ "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_MTD"), "value": "Month"},
                         { "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_QTD"), "value": "Quarter"},
                         { "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_YTD"), "value": "Year"},
                         { "label": $A.get("$Label.FinServ.Label_Client_Referral_Summary_All_Time"), "value": "All"}];
        component.set('v.periodKeys', periodKeys);
    },
    getScore: function(component, event, helper) {
        var action = component.get("c.getReferrerScore");
        action.setParams({
            "recordId": component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var score = response.getReturnValue();
                component.set("v.score", score);
            } else if (response.getState() === "ERROR") {
                component.set("v.errors", response.getError());
                helper.toggleShowError(component);
            }
        });
        $A.enqueueAction(action);
    },
    changedPeriod: function(component, event, helper, bypassCache) {
        var selectedPeriod = component.get("v.selectedPeriodKey");
        if (!bypassCache && selectedPeriod in component.get("v.data")) {
            component.set("v.dataToDisplayInField", component.get("v.data")[selectedPeriod]);
        } else {
            component.set("v.dataToDisplayInField", {}); // display a blank state

            var action = component.get("c.getReferrerSummary");
            action.setParams({
                "recordId": component.get("v.recordId"),
                "filter": component.get("v.selectedPeriodKey")
            });

            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var records = response.getReturnValue();
                    helper.updateData(component, helper, records);
                    component.set("v.dataToDisplayInField", component.get("v.data")[selectedPeriod]);
                } else if (response.getState() === "ERROR") {
                    component.set("v.errors", response.getError());
                    helper.toggleShowError(component);
                }
            });
            $A.enqueueAction(action);
        }
    },
    updateData: function(component, helper, value) {
        var fieldData = JSON.parse(JSON.stringify(component.get("v.fieldConfig"))); //clone the default setting
        var index; //for locker service
        for (index in fieldData) {
            var valueKey = fieldData[index]["valueKey"];
            if (!$A.util.isEmpty(valueKey) && valueKey in value) {
                fieldData[index]["value"] = value[valueKey];
            }
            if( valueKey === "Revenue") {
                fieldData[index]["shouldDisplay"] = component.get("v.displayRevenueFromReferrals") && value["RevenueVisibility"];
            } else  if( valueKey === "HHPenetration") {
                fieldData[index]["shouldDisplay"] = component.get("v.displayReferralsHHPenetration") && value["HouseholdVisibility"];
            } else if( valueKey === "AvgConversionRate") {
                fieldData[index]["shouldDisplay"] = component.get("v.displayAverageConversionRate") && value["HouseholdVisibility"];
            }
        }
        var data = component.get("v.data");
        data[component.get("v.selectedPeriodKey")] = fieldData;
        component.set("v.data", data);
    },
    toggleShowError: function(component) {
        var summary = component.find("summary");
        var error = component.find("errorMessage");

        $A.util.addClass(summary, "slds-hide");
        $A.util.removeClass(error, "slds-hide");
    },
    // Method to check if the account is of business record type. If yes, the component is not rendered.
    renderComponent: function(component, callback) {
        var recTypeAction = component.get("c.getReferrerInfo");
        recTypeAction.setParams({
            "recordID": component.get("v.recordId")
        });

        recTypeAction.setStorable();

        recTypeAction.setCallback(this, function(response) {
            var state = response.getState();

            if (state === "SUCCESS") {
                var res = response.getReturnValue();

                var renderComponent = !$A.util.isEmpty(res);
                component.set("v.renderComponent", renderComponent);

                if (renderComponent) {
                    callback();
                }
            } else if (state === "ERROR") {
                component.set("v.errors", response.getError());
                helper.toggleShowError(component);
            }
        });
        $A.enqueueAction(recTypeAction);
    }
})