({
	provide: function(cmp, event) {
		var columns = cmp.get("v.columns");
		if($A.util.isEmpty(columns)) {
			return;
		}

		var method = null;
		//add necessary fields
		var additionalColumns = ["Account.Name", "Contact.Name"];
		var id = null;
		if(cmp.get("v.direct") && $A.util.isEmpty(cmp.get("v.items"))) {
			//query group id
			method = "getHouseholdMembers";
			id = cmp.get("v.groupId");
		} else if(cmp.get("v.indirect")) {
			//query list of indirect members
			method = "getRelatedAccountsByContactIds";
			id = this.getContactIds(cmp);
		} else if(cmp.get("v.contact")) {
			additionalColumns = ["Contact__r.Name", "Role__r.Name", "RelatedContact__r.Name"];
			method = "getRelatedContactsByContactIds";
			id = this.getContactIds(cmp);
		}

		if(!$A.util.isEmpty(method) && !$A.util.isEmpty(id)) {
			var allColumns = columns.concat(additionalColumns);
			var action = cmp.get("c." + method);
			action.setParams({
				extraFieldsString: allColumns.join(),
				identifier: id
			});
			
			var self = this;
			var prefix = cmp.toString().match(/markup:\/\/(\w{1,15}):/)[1];
			prefix = prefix == "c" ? "" : prefix + "__";
			action.setCallback(this, function(response) {
				var state = response.getState();
				if (state === "SUCCESS") {
					//strip namespace from result
					var records = response.getReturnValue();
					var _records = JSON.parse(JSON.stringify(records).split(prefix).join(""));
					//fire event
					self.fireDataChangeEvent(cmp, _records, 1);
				} else if (response.getState() === "ERROR") {
					var errorEvent = cmp.getEvent("error");
					errorEvent.setParams({
						error: response.getError()
					}).fire();
				}
			});
			$A.enqueueAction(action);
		} else {
			//fire event with empty list
			this.fireDataChangeEvent(cmp, [], 1);
		}
	},
	getContactIds: function(cmp) {
		var ids = [];
		cmp.get("v.members").forEach(function(member) {
			//filter out any empty contact ids
			if(!$A.util.isEmpty(member.ContactId)) {
				ids.push(member.ContactId);
			}
		});
		return ids;
	},
	fireDataChangeEvent: function (dataProvider, data, currentPage) {
		var dataChangeEvent = dataProvider.getEvent("onchange");
		dataChangeEvent.setParams({
			data : data,
			currentPage : currentPage
		}).fire();
	}
})