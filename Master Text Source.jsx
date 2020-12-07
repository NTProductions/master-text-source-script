// master text source script

var globalLayers = [];
var globalLayerNames = [];



var window = new Window("palette", "Master Text Source", undefined);
window.orientation = "column";

// layer dropdown group
var groupOne = window.add("group", undefined, "groupOne");
groupOne.orientation = "row";
var layerDDText = groupOne.add("statictext", undefined, "Master Layer:");
var layerDD = groupOne.add("dropdownlist", undefined, globalLayerNames);
layerDD.size = [120, 25];
var refreshButton = groupOne.add("button", undefined, "+");
refreshButton.helpTip = "Refresh layers";
refreshButton.size = [25, 25];

// precomp checkbox and button group
var groupTwo = window.add("group", undefined, "groupTwo");
groupTwo.orientation = "row";
var precompCheckbox = groupTwo.add("checkbox", undefined, "Precomps");
precompCheckbox.helpTip = "Change the source text of precomp text layers also";
var applyButton = groupTwo.add("button", undefined, "Apply!");

window.center();
window.show();

init();

function init() {
	globalLayers = [];
	globalLayerNames = [];
    layerDD.removeAll();
	if(app.project.activeItem != null && app.project.activeItem instanceof CompItem) {
		for(var i = 1; i <= app.project.activeItem.numLayers; i++) {
			if(app.project.activeItem.layer(i).property("Source Text")) {
				globalLayers.push(app.project.activeItem.layer(i));
				globalLayerNames.push(i.toString()+". "+app.project.activeItem.layer(i).name);
                layerDD.add("item", globalLayerNames[globalLayerNames.length-1]);
			}
		}

	} else {
		globalLayerNames.push("No active composition");
	}
layerDD.selection = 0;
}

refreshButton.onClick = function() {
    init();
       }

applyButton.onClick = function() {
	if(app.project.activeItem == null || !(app.project.activeItem instanceof CompItem)) {
		alert("No active composition!");
		return false;
	}

	if(globalLayerNames[0] == "No active composition") {
		alert("No actual layer selected in the dropdown, try refreshing the UI or select a layer in the dropdown");
		return false;
	}

	var ddSelectionInt = parseInt(layerDD.selection.toString().slice(0, layerDD.selection.toString().indexOf(".")));


	masterSourceTextMain(app.project.activeItem.layer(ddSelectionInt), precompCheckbox.value);
}

function masterSourceTextMain(masterTextLayer, precompBool) {
	var thisPrecomp;
    
    app.beginUndoGroup("Master Source Text Process");
	for(var i = 1; i <= app.project.activeItem.numLayers; i++) {
		if(app.project.activeItem.layer(i).source) {
			// precomp handler section
			if(precompBool == true && app.project.activeItem.layer(i).source instanceof CompItem) {
				thisPrecomp = app.project.activeItem.layer(i).source;
				for(var e = 1; e <= thisPrecomp.numLayers; e++) {
					if(thisPrecomp.layer(e).property("Source Text")) {
						thisPrecomp.layer(e).property("Source Text").expression = 'comp("'+app.project.activeItem.name+'").layer("'+masterTextLayer.name+'").text.sourceText';
					}
				}
			}
		}
		//// end precomp handler section

		// normal text processing section
		if(app.project.activeItem.layer(i).property("Source Text") && app.project.activeItem.layer(i) != masterTextLayer) {
			app.project.activeItem.layer(i).property("Source Text").expression = 'comp("'+app.project.activeItem.name+'").layer("'+masterTextLayer.name+'").text.sourceText';
		}
		// end of normal text processing section
	}

    app.endUndoGroup();
}