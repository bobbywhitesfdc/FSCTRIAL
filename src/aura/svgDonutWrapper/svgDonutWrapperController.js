({
    onInit: function (component, event, helper) {
        var record = component.get("v.record");
        var actualValue = 'ActualValue__c';
        var targetValue = 'TargetValue__c';
        var percentage = (record[actualValue] / record[targetValue]) * 100;
        component.set("v.percentage", percentage);
    }
})