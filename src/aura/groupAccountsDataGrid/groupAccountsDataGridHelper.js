({
	onInit: function(cmp, event, helper) {
		this.createContactOptions(cmp, function(contactOptions) {
			var namespace = cmp.toString().match(/markup:\/\/(\w{1,15}):/)[1];
			var individualType = (namespace != 'c' ? namespace +'__' : '') + 'IndividualType__c';
			//filter on non-individuals, non-groups
			var additionalContext = { Account: {} };
			additionalContext.Account[individualType] = '';
			var columnsOverride = {
				AccountId: {
					"additionalContext": additionalContext
				},
				ContactId: {
					"type": "picklist",
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
	onMembersChange: function(cmp, event, helper) {
		var newContactMap = helper.createContactMap(cmp.get("v.members"));
		var contactMap = cmp.get("v.contactMap");
		//check if contact ids have changed
		var changed = $A.util.isEmpty(contactMap);
		for(var contactId in contactMap) {
			if(!newContactMap.hasOwnProperty(contactId)) {
				changed = true;
			}
		}
		if(changed) {
			cmp.find("indirectDataProvider").get("e.provide").fire();
		} else {
			helper.validate(cmp, event, helper);
		}
		//update contact options
		helper.setContactOptions(cmp, event, helper);
		cmp.set("v.contactMap", newContactMap);
	},
	setContactOptions: function(cmp, event, helper) {
		this.createContactOptions(cmp, function(contactOptions) {
			var columnsOverride = cmp.get("v.columnsOverride");
			columnsOverride.ContactId.picklistValues = contactOptions;
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
	},
	validate: function(cmp, event, helper) {
		//create map for lookup later
		var contactMap = helper.createContactMap(cmp.get("v.members"));

        //loop through all the items, create map of contactids to indexes
        var items = cmp.get("v.items");
        var existing = cmp.get("v.existing");
        var all = existing.concat(items);
        var accountContactMap = {};
        for(var i=0; i < all.length; i++) {
            var accountId = all[i].AccountId;
            var contactId = all[i].ContactId;
            var itemIndex = (i - existing.length);
            if($A.util.isEmpty(accountId) || $A.util.isEmpty(contactId)) {
                cmp.validateItem(itemIndex, "AccountId");
            } else {
                //create map of account+contactId as key
                var indexes = [];
                var key = accountId + contactId;
                if(!$A.util.isEmpty(accountContactMap[key])) {
                    indexes = accountContactMap[key];
                }
                indexes.push(itemIndex);
                accountContactMap[key] = indexes;
            }
            //if member associated is not a primary group, disable IncludeInGroup__c
            if(!$A.util.isEmpty(contactMap[contactId])) {
                var enabled = contactMap[contactId].PrimaryGroup__c;
                if(itemIndex >= 0) {
                    cmp.disableItem(itemIndex, "IncludeInGroup__c", !enabled);
                } else {
                    //rendered items are same as length of existing items
                    var addToGroup = cmp.find("addToGroup")
                    if(!addToGroup.length) {
                        addToGroup.set("v.disabled", !enabled); 
                        if (!enabled) {
                            addToGroup.set("v.value", enabled)
                        }
                    } else {
                        //if there are multiple buttons, returns the correct one
                        addToGroup.forEach(function(toggle) {
                            if(toggle.get("v.name") == i) {
                                toggle.set("v.disabled", !enabled);
                                if (!enabled) {
                                    toggle.set("v.value", enabled)
                                }
                            }
                        });
                    }
                }
            }
        }

        //loop through keys
        for(var key in accountContactMap) {
            var indexes = accountContactMap[key];
            if(!$A.util.isEmpty(indexes)) {
                //first instance is always valid
                cmp.validateItem(indexes[0], "AccountId");
                if(indexes.length > 1) {
                    //skip the first one as that is valid
                    for(var i=1; i < indexes.length; i++) {
                        cmp.invalidateItem(indexes[i], "AccountId", $A.get("$Label.FinServ.Msg_Error_Group_Account_Duplicate"));
                    }
                }
            }
        }
    },
    createContactMap: function(members) {
        var contactMap = {};
        members.forEach(function(member) {
            if(!contactMap.hasOwnProperty(member.ContactId)) {
                contactMap[member.ContactId] = member;
            }
        });
        return contactMap;
    }
})