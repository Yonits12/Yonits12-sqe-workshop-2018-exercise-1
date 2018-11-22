import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {exportComponents} from './code-analyzer';
import {global} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        //var json_obj = JSON.parse(parsedCode);
        exportComponents(parsedCode);
        fillTableHTML();
    });
});

function cloneEl(el) {
    var clo = el.cloneNode(true);
    return clo;
}

function cleanUpRow(obj) {
    var ch_nodes = obj.childNodes;
    for (var i = 0; ch_nodes[i]; ++i) {
        if (ch_nodes[i].tagName == 'TH') {
            ch_nodes[i].textContent = '';
        }
    }
}

function addRow(row_idx) {
    var root = document.getElementById('parseTable').getElementsByTagName('thead')[0];
    var rows = root.getElementsByTagName('tr');
    var clone = cloneEl(rows[rows.length - 1]);
    cleanUpRow(clone);
    fillUpRow(clone, row_idx);
    var root_to_put = document.getElementById('parseTable').getElementsByTagName('tbody')[rows.length - 1];
    root_to_put.appendChild(clone);
}

function fillTableHTML(){
    var root = document.getElementById('parseTable').getElementsByTagName('tbody')[0];
    var rows = root.getElementsByTagName('tr');
    var len_rows = rows.length;
    for(var j=0; j<len_rows; j++){
        document.getElementById('parseTable').deleteRow(1);
    }
    for(var i=0; i<global.length; i++) {
        addRow(i);
    }
}

function fillUpRow(clone, row_idx){
    var ch_nodes = clone.childNodes;
    for (var i = 0; ch_nodes[i]; ++i) {
        if (ch_nodes[i].tagName == 'TH') {
            fill_Line(ch_nodes[i], row_idx);
        }
    }
}

function fill_Line(ch_node, row_idx) {
    if (ch_node.id == 'Line') ch_node.textContent = global[row_idx].Line;
    else fill_Type(ch_node, row_idx);
}
function fill_Type(ch_node, row_idx){
    if (ch_node.id == 'Type') ch_node.textContent = global[row_idx].Type;
    else fill_Name(ch_node, row_idx);
}
function fill_Name(ch_node, row_idx){
    if (ch_node.id == 'Name') ch_node.textContent = global[row_idx].Name;
    else fill_Condition(ch_node, row_idx);
}
function fill_Condition(ch_node, row_idx){
    if (ch_node.id == 'Condition') ch_node.textContent = global[row_idx].Condition;
    else fill_Value(ch_node, row_idx);
}
function fill_Value(ch_node, row_idx){
    ch_node.textContent = global[row_idx].Value;
}