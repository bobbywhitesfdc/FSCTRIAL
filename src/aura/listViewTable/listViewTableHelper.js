({
	getFieldsList: function(cmp, event, helper) {
		var fsName = cmp.get("v.fieldSetName");	
		var fields = cmp.get("v.fields");
		// Call getFields for AAR and getFieldsFromObject for ACR
		var methodName = (!$A.util.isEmpty(fsName)) ? "getFields" : "getFieldsFromObject";
		if(cmp.get("v.readOnly")) {
			cmp.set("v.navigateToName", false);
			methodName = "getFieldsWithoutAccessibility";
		}
		var validateFieldSet = cmp.get("v.validateFieldSet");
		if(typeof(validateFieldSet) == "undefined") {
			validateFieldSet = false;
		}
		var action = cmp.get("c." + methodName);
		action.setParams({
			typeName: cmp.get("v.sObjectName"),
			fsName: fsName,
			fields: fields, 
			recordId: cmp.get("v.recordId"),
			validateFieldSet: validateFieldSet,
			filterInaccessibleFields : cmp.get("v.filterInaccessibleFields")
		});
		var self = this;
		action.setCallback(this, function(response) {
			if (response.getState() === "SUCCESS") {
				var fields = response.getReturnValue();

				if (fields == null) {
					fields = [];
				}
				//Looping each fieldsetmember and requrest custom label if any
				for (var index in fields) {
					var field = fields[index];
					field.label = self.convertLabel(field.label);
					if(!$A.util.isEmpty(cmp.get("v.relationshipObject"))) {
						field.fieldPath = cmp.get("v.relationshipObject") + "." + field.fieldPath;
					}
				}
				self.handleFieldListChange(cmp, fields, self);
			} else if (response.getState() === "ERROR") {
				var errorEvent = cmp.getEvent("error");
				var responseError;
				if(response.getError() == undefined) {
					responseError = response;
				} else {
					responseError = response.getError();
				}
				errorEvent.setParams({
					error: responseError
				}).fire();
			}
		});
		$A.enqueueAction(action);
	},
	handleFieldListChange: function(cmp, fields, helper) {
		//get fields from event
		var dataProvider = cmp.get("v.dataProvider") ? cmp.get("v.dataProvider")[0] : null;
		if(dataProvider && !$A.util.isEmpty(fields)) {
			var childTables = cmp.get("v.childTables");
			
			childTables.forEach(function(childTable){
				if (childTable.childTableIndicator != null) {
					fields.push({
						fieldPath: childTable.childTableIndicator
					});
				}
			});

			var aggregatedFields = this.getDisplayColumns(fields, cmp.get("v.calculatedFields"));

			//set headers
			cmp.set("v.columnHeaders", this.parseFieldLabels(aggregatedFields));

			//change columns on data provider to fire provide
			dataProvider.set("v.columns", fields);
		}
	},
	handleDataChange: function(cmp, event, helper) {
		//pull data & columns from data provider
		var dataProvider = cmp.get("v.dataProvider") ? cmp.get("v.dataProvider")[0] : null;

		var metadata = (dataProvider != null) ? dataProvider.get("v.columns") : [];
		metadata = this.getDisplayColumns(metadata, cmp.get("v.calculatedFields"));

		var eventData = event.getParams("data");
		var records = (eventData.data != null) ? eventData.data : null;
		
		if(records == null || $A.util.isEmpty(metadata)) {
			return;
		}		
		var childTables = cmp.get("v.childTables");
		var isExpandable = cmp.get("v.expandable");
		var navigateToName = cmp.get("v.navigateToName");
		var mainArr = [];
		var objArr = [];
		//loop through each object
		
		for (var i = 0; i < records.length; i++) {
			//check if SObjectWrapper
			if(!$A.util.isEmpty(records[i].json)) {
				records[i] = JSON.parse(records[i].json);
			}
			var recordRow = records[i];
			var lookupId =  recordRow.Id;
			var lookupName = recordRow.Name;
			objArr = [];
			var currentRecord = {};
			currentRecord.Id = recordRow.Id;
			var childTableIndicator = !$A.util.isEmpty(childTables);
			childTables.forEach(function(childTable){
				if (childTable.childTableIndicator != null) {
					if(childTable.childTableIndicator.indexOf('.') != -1) {
						lookupId = recordRow[childTable.recordId];
						lookupName = recordRow[childTable.recordName].Name;
						var childTableObj = childTable.childTableIndicator.split('.');
						childTableIndicator = (childTableIndicator && !! recordRow[childTableObj[0]][childTableObj[1]]);
					} else {
					childTableIndicator = (childTableIndicator && !!recordRow[childTable.childTableIndicator]);
					}
				}
			});
			currentRecord.expandable = (isExpandable && childTableIndicator);
			
			if(!$A.util.isEmpty(cmp.get("v.relationshipObject"))) {
				//assumption: no record for child relationship it will still be object, but need to have Id field queried. 
				var lookupRecord = recordRow[cmp.get("v.relationshipObject")];
				currentRecord.lookupId = lookupRecord.Id;
				currentRecord.lookupName = lookupRecord.Name;
			} else {
				currentRecord.lookupId = lookupId;
				currentRecord.lookupName = lookupName;
			}
			
			//loop through the given fields of the object
			for (var j = 0; j < metadata.length; j++) {
				var meta = metadata[j];

				if ($A.util.isEmpty(meta) || !meta.hasOwnProperty('fieldPath') || !meta.hasOwnProperty('type')) {
					$A.log("Error parsing ListViewTable response: " 
						+ JSON.stringify(meta) 
						+ "\n param: \n recordID = " + cmp.get("v.recordId") 
						+ "\n whereField = " + dataProvider.get("v.whereField") 
						+ "\n fields = " + metadata.join() 
						+ "\n sObjectName = " + cmp.get("v.sObjectName"));
					continue;
				}
				var record = {};
				var nameSuffix = ((!$A.util.isEmpty(cmp.get("v.relationshipObject"))) ? cmp.get("v.relationshipObject") + "." : "") + "Name";
				var indexOfName = meta.fieldPath.indexOf(nameSuffix, meta.fieldPath.length - nameSuffix.length);

				var value = this.locate(recordRow, meta.fieldPath);

				var picklistValues = meta.picklistValues;
				record.APIName = meta.fieldPath;
				record.fieldName = meta.label;
				record.fieldType = meta.type.toLowerCase();

				//if name, force type to be URL for link
				if (indexOfName !== -1 && navigateToName == true) {
					//only change to URL if Name field
					if (meta.fieldPath == "Name") {
						record.Id = recordRow.Id;
						record.lookupObj = recordRow;
						record.fieldType = "recordLookupUrl";
					} else if (meta.fieldPath.indexOf(".Name") !== -1) {
						var parentPath = meta.fieldPath.replace(".Name", "");
						if(!$A.util.isEmpty(recordRow[parentPath])) {
							record.Id = recordRow[parentPath].Id;
							record.lookupObj = recordRow[parentPath];
							record.fieldType = "recordLookupUrl";
						}
					}
				}
				if (picklistValues) {
					var foundItem = false;
					for(var picklistCount = 0; !foundItem && picklistCount < picklistValues.length; picklistCount++){
						var picklistItem = picklistValues[picklistCount];
						if(value == picklistItem.value){
							// overwrite display label with picklist item's label
							value = picklistItem.label;
							foundItem = true;
						}
					}
				}
				
				if (record.fieldType === "boolean") {
					value = $A.util.getBooleanValue(value);
				}
				record.fieldValue = value;

				//add current field value of list
				objArr.push(record);
			}
			//add all field values to each object so we can loop through it
			currentRecord.recordFieldInfo = objArr;
			mainArr.push(currentRecord);
		}
		//set to list of SObjects
		cmp.set("v.items", mainArr);
		this.showLoading(cmp, false);
	},
	//set the table component in the corresponding row on the table
	setExpandedTable: function(row, recordId, childTables) {
		childTables.forEach(function(childTable){
		
            var methodName = (!$A.util.isEmpty(childTable.methodName) ? childTable.methodName : "getRecordsById");
			var loadingComponent = (!$A.util.isEmpty(childTable.loadingIndicator) ? childTable.loadingIndicator : ["force:inlineSpinner", {}]);
			var dataProviderSObjectName = (!$A.util.isEmpty(childTable.dataProviderSObjectName) ? childTable.dataProviderSObjectName : childTable.sObjectName);
			$A.createComponents([
				["FinServ:listViewDataProvider", {
					"recordId": recordId,
					"sObjectName": dataProviderSObjectName,
					"whereField": childTable.whereField,
					"methodName": methodName
				}],
				loadingComponent
			], function (cmps, status, statusMessage) {
				if (status === "SUCCESS") {
					var attributes = {
						"class": "loadingIndicator-small",
						"recordId": recordId,
						"fieldSetName": childTable.fieldSetName,
						"sObjectName": childTable.sObjectName,
						"fixedWidth": childTable.fixedWidth,
						"actionTypes": childTable.actionTypes,
						"isChild": true,
						"numberIndicator": true,
						"percentageIndicator": true,
						"dataProvider": cmps[0],
						"loadingIndicator": cmps[1]
					};
					$A.createComponent("FinServ:listViewTable", attributes, function(cmp, status, statusMessage) {
						if (status === "SUCCESS") {
							var body = row.get("v.body");
							body.push(cmp);
							row.set("v.body", body);
						}
					});
				}
			});
		});
	},
	locate: function(obj, path) {
		path = path.split('.');
		var arrayPattern = /(.+)\[(\d+)\]/;
		for (var i = 0; i < path.length; i++) {
			if($A.util.isEmpty(obj)) {
				continue;
			}
			var match = arrayPattern.exec(path[i]);
			if (match) {
				obj = obj[match[1]][parseInt(match[2])];
			} else {
				obj = obj[path[i]];
			}
		}
		return obj;
	},
	convertLabel: function(label) {
		if (label != null && label.indexOf("$Label") == 0) {
			return $A.get(label);
		}
		return label;
	},
	parseFieldLabels: function(fieldInfo) {
		var fieldLabels = [];
		for (var i = 0; i < fieldInfo.length; i++) {
			if(fieldInfo[i].label) {
				fieldLabels.push(fieldInfo[i].label);
			}
		}
		return fieldLabels;
	},
	getDisplayColumns: function(fields, calculatedFields) {
		var columns = fields.slice(0);
		for(var i=0; i < calculatedFields.length; i++) {
			var col = calculatedFields[i];
			if(!$A.util.isEmpty(col.columnIndex)) {
				columns.splice(col.columnIndex, 0, col);
			} else {
				columns.push(col);
			}
		}
		return columns;
	}
})