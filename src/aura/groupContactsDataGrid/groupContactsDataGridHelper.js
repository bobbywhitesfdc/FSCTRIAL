({
	onInit: function(cmp, event, helper) {
		//set contact options on init
		this.createContactOptions(cmp, function(contactOptions) {
			var columnsOverride = {
				Contact__c: {
					"type": "picklist",
					"resetValue": true,
					"picklistValues": contactOptions
				}
			};
			cmp.set("v.columnsOverride", columnsOverride);
		});
	},
	onDataChange: function(cmp, event, helper) {
		var records = event.getParam("data");
		cmp.set("v.existing", records);
	},
	setContactOptions: function(cmp, event, helper) {
		this.createContactOptions(cmp, function(contactOptions) {
			var columnsOverride = cmp.get("v.columnsOverride");
			columnsOverride.Contact__c.picklistValues = contactOptions;
			cmp.set("v.columnsOverride", columnsOverride);
		});
	},
	createContactOptions: function(cmp, callback) {
		var members = cmp.get("v.members");
		var contactIds = [];
		members.forEach(function(member) {
			if(!$A.util.isEmpty(member.ContactId)) {
				//put primary first
				if(member.Primary__c) {
					contactIds.unshift(member.ContactId);
				} else {
					contactIds.push(member.ContactId);
				}
			}
		});
		if($A.util.isEmpty(contactIds) && typeof callback === 'function') {
			callback([]);
			return;
		}
	
		// get map of objects 
		var action = cmp.get("c.getRecordsMap");
		action.setParams({
			sObjectName: "Contact",
			fieldset: "Name",
			recordIds: contactIds
		});
		action.setStorable();
		action.setCallback(this, function(response) {
			if (response.getState() === "SUCCESS") {
				var contactMap = response.getReturnValue();
				//recreate from list passsed in
				var contacts = [];
				contactIds.forEach(function(id) {
					contacts.push({
						value: id,
						label: contactMap[id].Name
					});
				});
				if (cmp.get("v.initCreateContactOptionsCall") && contacts.length > 0) {
					var defaultValueOverride = {"ContactId" : contacts[0].value};
					cmp.set("v.defaultValueOverride", defaultValueOverride);
					cmp.set("v.initCreateContactOptionsCall", false);
				}
				if(typeof callback === 'function') {
					callback(contacts);
				}
			} else if (response.getState() === "ERROR" && typeof callback === 'function') {
				callback([]);
			}
		});
		$A.enqueueAction(action);
	}
})