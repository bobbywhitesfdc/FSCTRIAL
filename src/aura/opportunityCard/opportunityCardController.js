({
    doInit: function (component, event, helper) {
        var objectName = component.get("v.sObjectName");
        var uId = $A.get("$SObjectType.CurrentUser.Id");
        var condition = {
            IsClosed: 'false',
            ownerId: uId
        };
        
        component.set("v.filterCriteria", condition);
        component.set("v.currencyFormat", $A.get("$Locale.currencyFormat").replace(/.00/g, ""));
        helper.getList(component);
        helper.getRecordCount(component);
    }
})