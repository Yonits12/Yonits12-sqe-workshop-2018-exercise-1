import * as esprima from 'esprima';


var global = [];
var codeString;

const parseCode = (codeToParse) => {
    global = [];
    codeString = codeToParse;
    return esprima.parseScript(codeToParse, {loc: true, range: true});
};

function val_of_init_helper(parsedVarDecl, i){
    var val_of_init;
    if(parsedVarDecl.declarations[i].init == null)
        val_of_init = String(parsedVarDecl.declarations[i].init);
    else
        val_of_init = parsedVarDecl.declarations[i].init.raw;
    return val_of_init;
}
function variableExporter(parsedVarDecl){
    for(var i=0; i<parsedVarDecl.declarations.length; i++){
        const varStruct = {
            'Line': parsedVarDecl.loc.start.line.toString(),
            'Type': parsedVarDecl.type,
            'Name': parsedVarDecl.declarations[i].id.name,
            'Condition': '',
            'Value': val_of_init_helper(parsedVarDecl, i)};
        global.push(varStruct);}
}

function exportIdentifiers(params) {
    for(var i=0; i<params.length; i++){
        const varStruct = {
            'Line': params[i].loc.start.line.toString(),
            'Type': params[i].type,
            'Name': params[i].name,
            'Condition': '',
            'Value': ''};
        global.push(varStruct);}
}
function functionExporter(parsedFuncDecl){
    const funcStruct = {
        'Line': parsedFuncDecl.loc.start.line.toString(),
        'Type': parsedFuncDecl.type,
        'Name': parsedFuncDecl.id.name,
        'Condition': '',
        'Value': ''};
    global.push(funcStruct);
    exportIdentifiers(parsedFuncDecl.params);
    parsedFuncDecl.body.body.forEach(exportComponents);
}

function returnExporter(parsedRetStat) {
    const retStruct = {
        'Line': parsedRetStat.loc.start.line.toString(),
        'Type': parsedRetStat.type,
        'Name': '',
        'Condition': '',
        'Value': expExportDirector[parsedRetStat.argument.type](parsedRetStat.argument)};
    global.push(retStruct);
}

function consequent_exporter(consequent) {
    if(consequent.type != 'BlockStatement')
        exportComponents(consequent);
    else
        consequent.body.forEach(exportComponents);
}
function alternate_exporter(alternate) {
    if(alternate.type == 'IfStatement')
        ifExporter(alternate, 'ElseType');
    else if(alternate.type != 'BlockStatement')
        exportComponents(alternate);
    else // so it is a block
        alternate.body.forEach(exportComponents);
}
function ifExporter(parsedIfStat, ...elseType) {
    var type = parsedIfStat.type;
    if(elseType.length>0 && elseType[0]=='ElseType') type='ElseIfStatment';
    const ifStruct = {
        'Line': parsedIfStat.loc.start.line.toString(),
        'Type': type,
        'Name': '',
        'Condition': codeString.substring(parsedIfStat.test.range[0], parsedIfStat.test.range[1]),
        'Value': ''};
    global.push(ifStruct);
    consequent_exporter(parsedIfStat.consequent);
    alternate_exporter(parsedIfStat.alternate);
}

function assignmentExporter(parsedAssStat) {
    const assStruct = {
        'Line': parsedAssStat.loc.start.line.toString(),
        'Type': parsedAssStat.type,
        'Name': codeString.substring(parsedAssStat.left.range[0], parsedAssStat.left.range[1]),
        'Condition': '',
        'Value': codeString.substring(parsedAssStat.right.range[0], parsedAssStat.right.range[1])};
    global.push(assStruct);
}
function updateExporter(parsedUpdateStat){
    const upStruct = {
        'Line': parsedUpdateStat.loc.start.line.toString(),
        'Type': parsedUpdateStat.type,
        'Name': parsedUpdateStat.argument.name,
        'Condition': '',
        'Value': codeString.substring(parsedUpdateStat.range[0], parsedUpdateStat.range[1])};
    global.push(upStruct);
}
const expStatmentFuncDirector = {
    'AssignmentExpression': assignmentExporter,
    'UpdateExpression': updateExporter};

function expressionExporter(parsedCode){
    expStatmentFuncDirector[parsedCode.expression.type](parsedCode.expression);
}

function forExporter(parsedForCode){
    const forStruct = {
        'Line': parsedForCode.loc.start.line.toString(),
        'Type': parsedForCode.type,
        'Name': '',
        'Condition': codeString.substring(parsedForCode.test.range[0], parsedForCode.test.range[1]),
        'Value': ''};
    global.push(forStruct);
    exportComponents(parsedForCode.init);
    exportComponents(parsedForCode.update);
    consequent_exporter(parsedForCode.body);
}

function whileExporter(parsedWhileCode){
    const whileStruct = {
        'Line': parsedWhileCode.loc.start.line.toString(),
        'Type': parsedWhileCode.type,
        'Name': '',
        'Condition': codeString.substring(parsedWhileCode.test.range[0], parsedWhileCode.test.range[1]),
        'Value': ''};
    global.push(whileStruct);
    consequent_exporter(parsedWhileCode.body);
}



const parseFunctionDirector = {
    'VariableDeclaration': variableExporter,
    'FunctionDeclaration': functionExporter,
    'ExpressionStatement': expressionExporter,
    'AssignmentExpression': assignmentExporter,
    'UpdateExpression': updateExporter,
    'WhileStatement': whileExporter,
    'IfStatement': ifExporter,
    'ReturnStatement': returnExporter,
    'ForStatement': forExporter
};

function identifierExporter(parsedExp) {
    return parsedExp.name;
}
function literalExporter(parsedExp) {
    return parsedExp.raw;
}
function unaryExpExporter(parsedExp) {
    return parsedExp.operator + expExportDirector[parsedExp.argument.type](parsedExp.argument);
}
function binaryExpExporter(parsedExp) {
    return expExportDirector[parsedExp.left.type](parsedExp.left) + parsedExp.operator + expExportDirector[parsedExp.right.type](parsedExp.right);
}

const expExportDirector = {
    'Identifier': identifierExporter,
    'Literal': literalExporter,
    'UnaryExpression': unaryExpExporter,
    'BinaryExpression': binaryExpExporter
};

function exportComponents(parsedCode){
    if(parsedCode.type == 'Program') {
        parsedCode.body.forEach(exportComponents);
    }
    else{
        parseFunctionDirector[parsedCode.type](parsedCode);
    }
    return global;
}

export {parseCode};
export {exportComponents};
export {global};