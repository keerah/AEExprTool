// AEexpTool.jsx
// Copyright (c) 2018 Keerah, keerah.com. All rights reserved
//
// Name: AEexprTool
// Version: 0.2
//
// Description:
// Error correction control for After Effects expressions
//

(function ExprTool(thisObj)
{
    // Store globals in an object
    var ExprToolData = new Object();	
	ExprToolData.scriptName = "AE Expression Tool";
	ExprToolData.scriptTitle = ExprToolData.scriptName + " v0.2";
    ExprToolData.strHelpText = 
		"Copyright (c) 2018 Keerah. \n" +
		"All rights reserved.\n" +
		"\n" +
		"This script modifies expressions by enabling or desabling error control\n" +
        "Note: Compatiblity: AE 2018. Dockable when run form Script UI folder.";

	ExprToolData.openCode = "try {";
	ExprToolData.closeCode = "} catch(err) { value }";
	ExprToolData.actionScope = 0;
	ExprToolData.actionType = 0;
	ExprToolData.Indent = 1; // default enabled
	ExprToolData.indentVal = 3;
	ExprToolData.indentStr = "   ";
	ExprToolData.report = ["No expressions has been modified", " added/uncommented EC", " EC commented", " EC removed"];
	ExprToolData.newLine = ($.os.indexOf("Windows") > -1) ? "\r\n" : "\n"; // windows LF+CR, mac LF
	ExprToolData.newLineIndent = ExprToolData.newLine + ExprToolData.indentStr;

	//v.2
	ExprToolData.openSearchStr = "\\s*/try\\s*(\\r\\n)?\\{\\s*";
	ExprToolData.closeSearchStr = "\\s*\\}\\s*catch\\s*\\(\\s*err\\s*\\)\\s*\\{\\s*value\\s*\\}\\s*(\\r\\n)?";

	const actionEnable = 1; const actionDisable = 2; const actionRemove = 3;
	const compScope = 1; const layerScope = 2; const propertyScope = 3;

	function ExprTool_buildUI(thisObj)
	{
		var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette",ExprToolData.scriptName, undefined, {resizeable:true,}); //[0,0,100,410]
		if (pal !== null)
		{
			// generating UI code
			pal.spacing = 5;
            pal.margins = [3,5,3,3];
			pal.orientation = "column";
			ScopePanel = pal.add("panel", undefined, "SCOPE"); //[5,5,340,55]
			ScopePanel.margins = [5,10,5,5];
			group_scope = ScopePanel.add("group", undefined); group_scope.orientation = "row";//[5,8,325,108]
			rb_Comp = group_scope.add("radiobutton", undefined, "Composition"); rb_Comp.value = 1; rb_Comp.helpTip="Current composition only"; //[0,5,90,25]
			rb_Layer = group_scope.add("radiobutton", undefined, "Layer"); rb_Layer.value = 0; rb_Layer.helpTip="Current layer only"; //[95,5,185,25]
			rb_Property = group_scope.add("radiobutton", undefined, "Property"); rb_Property.value = 0; rb_Property.helpTip = "Current property only"; //[160,5,250,25]
			
			ErrCtrlPanel = pal.add("panel", undefined, "ERROR CONTROL");  //[5,60,100,405]
			ErrCtrlPanel.alignChildren = ["fill","top"]; ErrCtrlPanel.spacing = 10; ErrCtrlPanel.margins = [5,10,5,5];
			group_open = ErrCtrlPanel.add("group"); //[5,10,325,100]
			group_open.orientation = "column"; group_open.alignChildren = ["fill","top"]; group_open.spacing = 2;
			openText = group_open.add("statictext", undefined, "Error control open code"); //[0,0,300,20]
			openTextField = group_open.add("edittext", undefined, ExprToolData.openCode, {readonly:0,noecho:0,borderless:0,multiline:1,enterKeySignalsOnChange:0}); //[0,20,100,80]
			openTextField.onChange = function()
			{
				if (openTextField.text == "") openTextField.text = ExprToolData.openCode;
			}
			openSearchText = group_open.add("statictext",undefined ,"RegExp search pattern for open code"); //[0,55,90,135]
			openSearchField = group_open.add("edittext",undefined , ExprToolData.openSearchStr, {readonly:0,noecho:0,borderless:0,multiline:0,enterKeySignalsOnChange:0}); //[0,103,320,123]
			openSearchField.onChange = function()
			{
				if (openTextField.text == "") openTextField.text = ExprToolData.openSearchStr;
			}

			group_close = ErrCtrlPanel.add("group"); //[5,140,325,150]
			group_close.orientation = "column"; group_close.alignChildren = ["fill","top"]; group_close.spacing = 2; 
			closeText = group_close.add("statictext", undefined, "Error control close code"); //[0,0,290,20]
			closeTextField = group_close.add("edittext", undefined, ExprToolData.closeCode,{readonly:0,noecho:0,borderless:0,multiline:1,enterKeySignalsOnChange:0}); //[0,20,100,80]
			closeTextField.onChange = function()
			{
				if (closeTextField.text == "") closeTextField.text = ExprToolData.closeCode;
			}
			closeSearchText = group_close.add("statictext", undefined ,"RegExp search pattern for close code"); //[0,85,290,105]
			closeSearchField = group_close.add("edittext", undefined, ExprToolData.closeSearchStr, {readonly:0,noecho:0,borderless:0,multiline:0,enterKeySignalsOnChange:0}); //[0,103,325,123]
			closeSearchField.onChange = function()
			{
				if (closeTextField.text == "") closeTextField.text = ExprToolData.closeSearchStr;
			}

			group_buttons = ErrCtrlPanel.add("group"); //[5,270,330,10]
			group_buttons.alignChildren = ["fill","top"]; group_buttons.margins = [5,10,5,10];
			enableButton = group_buttons.add("button", undefined, "Enable/Add"); enableButton.helpTip = "Add the EC code or uncomment it if present"; //[0,5,105,35]
			enableButton.onClick = function()
			{
				 ExprTool_Run(actionEnable);
			}
			disableButton = group_buttons.add("button", undefined,"Disable"); disableButton.helpTip = "Comment EC code"; //[110,5,210,35]
			disableButton.onClick = function()
			{
				ExprTool_Run(actionDisable);
			}
			removeButton = group_buttons.add("button", undefined,"Remove");	removeButton.helpTip = "Remove EC code"; // [215,5,320,35]
			removeButton.onClick = function()
			{
				ExprTool_Run(actionRemove);
			}

			checkIndent = ErrCtrlPanel.add("checkbox", undefined, "Adjust Indentation"); checkIndent.value = ExprToolData.Indent; //[0,45,150,65]
			// end of generating UI code
			
			pal.layout.layout(true);
			//pal.grp.minimumSize = pal.grp.size;
			pal.layout.resize();
			pal.onResizing = pal.onResize = function () {this.layout.resize();} // works wrong
		}
		return pal;
	}

	function ExprTool_Apply(propParent)
	{
		var curExpression = "";
		// loop through all subproperties
		for (var i = 1; i <= propParent.numProperties; i++)
		{
			prop = propParent.property(i);
			if (((prop.propertyType === PropertyType.PROPERTY) && (prop.expression !== "") && prop.canSetExpression))
			{
				curExpression = prop.expression.replace(/(\r\n)+\s*$/gi,"");  //trim end
				curExpression = curExpression.replace(/^\s*(\r\n)+/gi, "");       // trim start
				// if commented EC open present
				if (curExpression.match(/\/+\s*try\s*(\r\n)?\{\s*/gi) !== null) 
				{
					switch (ExprToolData.actionType)
					{
						case actionEnable:
							//replace with uncommented EC
							curExpression = curExpression.replace((/\/+\s*try\s*(\r\n)?\{/gi), ExprToolData.openCode);
							prop.expression = curExpression.replace((/\/+\s*\}\s*catch\s*\(\s*err\s*\)\s*\{\s*value\s*\}\s*/gi), ExprToolData.closeCode);
							//$.writeln("  EC uncommented for " + prop.name);
							ExprToolData.resCount++;
							break;

						case actionDisable:
							//$.writeln("  commented EC already disabled for " + prop.name);
							break;

						case actionRemove:
							//remove open code
							curExpression = curExpression.replace((/\/+\s*try\s*(\r\n)?\{*(\r\n)?/gi), ""); 
							// remove close code
							curExpression = curExpression.replace((/\/+\s*\}\s*catch\s*\(\s*err\s*\)\s*\{\s*value\s*\}\s*(\r\n)?/gi), ""); 
							// unindent
							if (ExprToolData.indent == 1) curExpression = curExpression.replace(/^   /gm, ""); 
							prop.expression = curExpression;
							//$.writeln("  commented EC erased for " + prop.name);
							ExprToolData.resCount++;
							break;
					}
				}
	
				// if clean EC open not present and Enable action selected
				else if ((curExpression.match(/try\s*(\r\n)?\{\s*/ig) == null) && (ExprToolData.actionType == actionEnable))
				{
					//add clean EC + indent
					//if (ExprToolData.indent == 1) curExpression = curExpression.replace(/(\r\n)/gi, ExprToolData.newLine + ExprToolData.indentStr); // add 1 indent
					if (ExprToolData.indent == 1) curExpression = ExprToolData.indentStr + curExpression.split(ExprToolData.newLine).join(ExprToolData.newLineIndent); // indent
					curExpression = ExprToolData.openCode + ExprToolData.newLine + curExpression + ExprToolData.newLine + ExprToolData.closeCode;
					prop.expression = curExpression;
					//$.writeln("  clean EC added for " + prop.name);
					ExprToolData.resCount++;
				}
				// if clean EC present
				else if (curExpression.match(/try\s*(\r\n)?\{\s*/ig) != null)
				{
					switch (ExprToolData.actionType) 
					{
						case actionEnable:
							//$.writeln("  clean EC already present");
							break;

						case actionDisable:
							// add commenting to clean EC
							curExpression = curExpression.replace((/try\s*(\r\n)?\{/gi), "// " + ExprToolData.openCode);
							prop.expression = curExpression.replace(( /\s*\}\s*catch\s*\(\s*err\s*\)\s*\{\s*value\s*\}\s*/gi), ExprToolData.newLine + "// " + ExprToolData.closeCode);
							//$.writeln("  commented clean EC for " + prop.name);
							ExprToolData.resCount++;
							break;

						case actionRemove:
							curExpression = curExpression.replace((/try\s*(\r\n)?\{\s*/gi), "");
							curExpression = curExpression.replace((/\s*\}\s*catch\s*\(\s*err\s*\)\s*\{\s*value\s*\}\s*(\r\n)?\s*/gi), "");
							// uindent
							if (ExprToolData.indent == 1) curExpression = curExpression.replace(/^   /gm, ""); 
							prop.expression = curExpression;
							//$.writeln("  clean EC erased for " + prop.name);
							ExprToolData.resCount++;
							break;
					}
				}
			}

			else if ((prop.propertyType === PropertyType.INDEXED_GROUP) || (prop.propertyType === PropertyType.NAMED_GROUP))
				ExprTool_Apply(prop); //recurse subproperties

			else if ((prop.matchName == "ADBE Layer Styles" && prop.canSetEnabled==false)||(prop.matchName == "ADBE Material Options Group" &&
			prop.propertyGroup(prop.propertyDepth).threeDLayer == false) || (prop.matchName == "ADBE Audio Group" &&
			prop.propertyGroup(prop.propertyDepth).hasAudio == false)||(prop.matchName == "ADBE Extrsn Options Group")||
			(prop.matchName == "ADBE Plane Options Group")||(prop.matchName == "ADBE Vector Materials Group"))
				//$.writeln("!!! wtf " + prop.matchName);
				void 0;
			else
				ExprTool_Apply(prop);	//recurse subproperties
		}
	}

	// run the tool, action: 1 - enable(uncomment or add), 2 - disable (cooment), 3 - remove

	function ExprTool_Run(actionType)
	{
		ExprToolData.actionType = actionType;
		ExprToolData.actionScope = rb_Comp.value + rb_Layer.value * 2 + rb_Property.value * 3;
		ExprToolData.openCode = openTextField.text;
		ExprToolData.closeCode = closeTextField.text;
		ExprToolData.indent = checkIndent.value;
		ExprToolData.resCount = 0;
		ExprToolData.openSearchStr = openSearchField.text;
		ExprToolData.closeSearchStr = closeSearchField.text;
		
		//$.writeln("=== Requested action: " + actionType + " in " + ExprToolData.actionScope + " indent = " + ExprToolData.indent);

		var comp = app.project.activeItem;
		if ((comp === null) || !(comp instanceof CompItem))
		{
			alert("No active composition", ExprToolData.scriptName);
			return;
		}
		else
		{	
			// Process the layers in the current comp
    		//$.writeln("=== processing comp " + comp.name + " ===");
			if (comp.numLayers > 0)
			{
				app.beginUndoGroup(ExprToolData.scriptName);
				for (var j = 1; j <= comp.numLayers; j++)
				{
					//$.writeln("processing the layer " + comp.layer(j).name);
					ExprTool_Apply(comp.layer(j));
				}
				app.endUndoGroup();
			}
			else
				alert("No layers in current composition " + comp.name, ExprToolData.scriptName);
		}
		alert(((ExprToolData.resCount == 0) ? ExprToolData.report[0] : (ExprToolData.resCount + ExprToolData.report[actionType])), ExprToolData.scriptName);
	}

	// main code
	var exprToolPal = ExprTool_buildUI(thisObj);
	if (exprToolPal !== null)
	{
		if (exprToolPal instanceof Window)
		{
			exprToolPal.center();
			exprToolPal.show();
		}
		else
			exprToolPal.layout.layout(true);
	}

})(this);