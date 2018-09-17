({
	handleDataChange: function (cmp, event, helper) {
        var listViewCard = cmp.find("listViewCard");
        var dataProvider = listViewCard.get("v.dataProvider")[0];
        var count = dataProvider.get("v.totalItems");
        var limit = dataProvider.get("v.pageSize");
        var items = dataProvider.get("v.items");
        if (count > limit) {
            listViewCard.set("v.subtitle", limit.toString() + "+");
        } else {
            listViewCard.set("v.subtitle", count);
        }
        listViewCard.set("v.showViewAll", count > 0);
    }
    ,
	onDataLoadError: function(cmp, event, helper) {
		var listViewCard = cmp.find("listViewCard");
        var dataProvider = listViewCard.get("v.dataProvider")[0];
        listViewCard.set("v.hasDataLoadError", true);
	}
})