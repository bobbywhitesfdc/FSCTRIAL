({
    onInit: function(component, event, helper) {
        var recordId = component.get("v.recordId");
        var dataProvider = component.get('v.dataProvider');
        var provideEvent = dataProvider[0].get('e.provide');
        var parameters = {'recordId':recordId};
        var eventData = {"parameters" : parameters};
        provideEvent.setParams(eventData);
        provideEvent.fire();
    },

    setTreeData: function(component, treeRoot){
        var treeLeafComponentName = component.get('v.treeLeafComponentName');
        component.set("v.rootObject", treeRoot);
        if(!$A.util.isEmpty(treeRoot)) {
            if (treeRoot.isGroup) {
                $A.createComponent(treeLeafComponentName, {
                        'entity': treeRoot
                    },
                    function(rootLeaf,status, errorMessage) {
                        component.set("v.rootLeaf", rootLeaf);
                    }
                );
            }
        }

        component.set("v.loading", false);
    }
})