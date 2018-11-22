import assert from 'assert';
import {exportComponents, parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty program correctly', () => {
        assert.equal(JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script","range":[0,0]' +
            ',"loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration",' +
            '"declarations":[{"type":"VariableDeclarator","id":{"type":' +
            '"Identifier","name":"a","range":[4,5],"loc":{"start":{"line"' +
            ':1,"column":4},"end":{"line":1,"column":5}}},"init":{"type":' +
            '"Literal","value":1,"raw":"1","range":[8,9],"loc":{"start":' +
            '{"line":1,"column":8},"end":{"line":1,"column":9}}},"range":' +
            '[4,9],"loc":{"start":{"line":1,"column":4},"end":{"line":1,' +
            '"column":9}}}],"kind":"let","range":[0,10],"loc":{"start":' +
            '{"line":1,"column":0},"end":{"line":1,"column":10}}}],' +
            '"sourceType":"script","range":[0,10],"loc":{"start":{"line"' +
            ':1,"column":0},"end":{"line":1,"column":10}}}'
        );
    });

    it('is parsing an empty function with return statement correctly', () => {
        assert.equal(JSON.stringify(parseCode('function foo(){ return 1; }')),
            '{"type":"Program","body":[{"type":"FunctionDeclaration","id":{"type":' +
            '"Identifier","name":"foo","range":[9,12],"loc":{"start":{"line":1,' +
            '"column":9},"end":{"line":1,"column":12}}},"params":[],"body":{"type":' +
            '"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":' +
            '"Literal","value":1,"raw":"1","range":[23,24],"loc":{"start":{"line":' +
            '1,"column":23},"end":{"line":1,"column":24}}},"range":[16,25],"loc":' +
            '{"start":{"line":1,"column":16},"end":{"line":1,"column":25}}}],"range":' +
            '[14,27],"loc":{"start":{"line":1,"column":14},"end":{"line":1,"column":27}}}' +
            ',"generator":false,"expression":false,"async":false,"range":[0,27],"loc":' +
            '{"start":{"line":1,"column":0},"end":{"line":1,"column":27}}}],"sourceType":' +
            '"script","range":[0,27],"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":27}}}'
        );
    });

    it('is preparing data structure of a simple variable declaration correctly', () => {
        assert.deepEqual(
            exportComponents(parseCode('let a = 1;')),
            [{Line: '1', Type: 'VariableDeclaration', Name: 'a', Condition: '', Value: '1'}]
        );
    });

    it('is preparing data structure of a 3 initialized variable declarations correctly', () => {
        assert.deepEqual(
            exportComponents(parseCode('let w, x=10, y=20, z=30;')),
            [   {Line: '1', Type: 'VariableDeclaration', Name: 'w', Condition: '', Value: 'null'},
                {Line: '1', Type: 'VariableDeclaration', Name: 'x', Condition: '', Value: '10'},
                {Line: '1', Type: 'VariableDeclaration', Name: 'y', Condition: '', Value: '20'},
                {Line: '1', Type: 'VariableDeclaration', Name: 'z', Condition: '', Value: '30'}  ]
        );
    });

    it('is preparing data structure of simple if-else statement and simple assignment expression correctly', () => {
        assert.deepEqual(
            exportComponents(parseCode('let w, x=10, y=20, z=30;\n' +
                'if(x>y){\n' +
                'w=x;\n' +
                '}\n' +
                'else{\n' +
                'w=z;\n' +
                '}\n')),
            [   {Line: '1', Type: 'VariableDeclaration', Name: 'w', Condition: '', Value: 'null'},
                {Line: '1', Type: 'VariableDeclaration', Name: 'x', Condition: '', Value: '10'},
                {Line: '1', Type: 'VariableDeclaration', Name: 'y', Condition: '', Value: '20'},
                {Line: '1', Type: 'VariableDeclaration', Name: 'z', Condition: '', Value: '30'},
                {Line: '2', Type: 'IfStatement', Name: '', Condition: 'x>y', Value: ''},
                {Line: '3', Type: 'AssignmentExpression', Name: 'w', Condition: '', Value: 'x'},
                {Line: '6', Type: 'AssignmentExpression', Name: 'w', Condition: '', Value: 'z'}  ]
        );
    });

    it('is preparing data structure of complex if-ifelse-else expression including member expressions correctly', () => {
        assert.deepEqual(
            exportComponents(parseCode('let w, x=10, y=20, z=30;\n' +
                'if(x>y){\n' +
                'w[0]=x;\n' +
                '}\n' +
                'else if((x+y)>z){\n' +
                'w[1] = w[0] + y;\n' +
                '}\n' +
                'else{\n' +
                'w[1] = w[0] + w[0];\n' +
                '}')),
            [   {Line: '1', Type: 'VariableDeclaration', Name: 'w', Condition: '', Value: 'null'},
                {Line: '1', Type: 'VariableDeclaration', Name: 'x', Condition: '', Value: '10'},
                {Line: '1', Type: 'VariableDeclaration', Name: 'y', Condition: '', Value: '20'},
                {Line: '1', Type: 'VariableDeclaration', Name: 'z', Condition: '', Value: '30'},
                {Line: '2', Type: 'IfStatement', Name: '', Condition: 'x>y', Value: ''},
                {Line: '3', Type: 'AssignmentExpression', Name: 'w[0]', Condition: '', Value: 'x'},
                {Line: '5', Type: 'ElseIfStatment', Name: '', Condition: '(x+y)>z', Value: ''},
                {Line: '6', Type: 'AssignmentExpression', Name: 'w[1]', Condition: '', Value: 'w[0] + y'},
                {Line: '9', Type: 'AssignmentExpression', Name: 'w[1]', Condition: '', Value: 'w[0] + w[0]'}  ]
        );
    });

    it('is preparing data structure of a simple function with parameters and complex return statement correctly', () => {
        assert.deepEqual(
            exportComponents(parseCode('function foo(A, B, c){ return A+B-c; }')),
            [   {Line: '1', Type: 'FunctionDeclaration', Name: 'foo', Condition: '', Value: ''},
                {Line: '1', Type: 'Identifier', Name: 'A', Condition: '', Value: ''},
                {Line: '1', Type: 'Identifier', Name: 'B', Condition: '', Value: ''},
                {Line: '1', Type: 'Identifier', Name: 'c', Condition: '', Value: ''},
                {Line: '1', Type: 'ReturnStatement', Name: '', Condition: '', Value: 'A+B-c'}  ]
        );
    });

    it('is preparing data structure of a simple while loop with variable declaration and update expression correctly', () => {
        assert.deepEqual(
            exportComponents(parseCode('let x=10; while(x>0){ x--; }')),
            [   {Line: '1', Type: 'VariableDeclaration', Name: 'x', Condition: '', Value: '10'},
                {Line: '1', Type: 'WhileStatement', Name: '', Condition: 'x>0', Value: ''},
                {Line: '1', Type: 'UpdateExpression', Name: 'x', Condition: '', Value: 'x--'}  ]
        );
    });

    it('is preparing data structure of a simple for loop with variable declaration and update expression correctly', () => {
        assert.deepEqual(
            exportComponents(parseCode('let x=10;\n' +
                'for(let i=0; i<x; i++){\n' +
                'x=x+1;\n' +
                '}')),
            [   {Line: '1', Type: 'VariableDeclaration', Name: 'x', Condition: '', Value: '10'},
                {Line: '2', Type: 'ForStatement', Name: '', Condition: 'i<x', Value: ''},
                {Line: '2', Type: 'VariableDeclaration', Name: 'i', Condition: '', Value: '0'},
                {Line: '2', Type: 'UpdateExpression', Name: 'i', Condition: '', Value: 'i++'},
                {Line: '3', Type: 'AssignmentExpression', Name: 'x', Condition: '', Value: 'x+1'}  ]
        );
    });

    it('is preparing data structure of a  complex function correctly', () => {
        assert.deepEqual(
            exportComponents(parseCode('function fakeBinarySearch(X, V, n){\n' +
                '    let low, high, mid;\n' +
                '    low = 0;\n' +
                '    high = n - 1;\n' +
                '    while (low <= high) {\n' +
                '        mid = (low + high)/2;\n' +
                '        if (X < V[mid])\n' +
                '            high = mid - 1;\n' +
                '        else if (X > V[mid])\n' +
                '            low = mid + 1;\n' +
                '        else\n' +
                '            return mid;\n' +
                '    }\n' +
                'for(b=99; b<(3*high); b++){\n' +
                'c=c+3;\n' +
                '}\n' +
                '    return -1;\n' +
                '}')),
            [   {Line: '1', Type: 'FunctionDeclaration', Name: 'fakeBinarySearch', Condition: '', Value: ''},
                {Line: '1', Type: 'Identifier', Name: 'X', Condition: '', Value: ''},
                {Line: '1', Type: 'Identifier', Name: 'V', Condition: '', Value: ''},
                {Line: '1', Type: 'Identifier', Name: 'n', Condition: '', Value: ''},
                {Line: '2', Type: 'VariableDeclaration', Name: 'low', Condition: '', Value: 'null'},
                {Line: '2', Type: 'VariableDeclaration', Name: 'high', Condition: '', Value: 'null'},
                {Line: '2', Type: 'VariableDeclaration', Name: 'mid', Condition: '', Value: 'null'},
                {Line: '3', Type: 'AssignmentExpression', Name: 'low', Condition: '', Value: '0'},
                {Line: '4', Type: 'AssignmentExpression', Name: 'high', Condition: '', Value: 'n - 1'},
                {Line: '5', Type: 'WhileStatement', Name: '', Condition: 'low <= high', Value: ''},
                {Line: '6', Type: 'AssignmentExpression', Name: 'mid', Condition: '', Value: '(low + high)/2'},
                {Line: '7', Type: 'IfStatement', Name: '', Condition: 'X < V[mid]', Value: ''},
                {Line: '8', Type: 'AssignmentExpression', Name: 'high', Condition: '', Value: 'mid - 1'},
                {Line: '9', Type: 'ElseIfStatment', Name: '', Condition: 'X > V[mid]', Value: ''},
                {Line: '10', Type: 'AssignmentExpression', Name: 'low', Condition: '', Value: 'mid + 1'},
                {Line: '12', Type: 'ReturnStatement', Name: '', Condition: '', Value: 'mid'},
                {Line: '14', Type: 'ForStatement', Name: '', Condition: 'b<(3*high)', Value: ''},
                {Line: '14', Type: 'AssignmentExpression', Name: 'b', Condition: '', Value: '99'},
                {Line: '14', Type: 'UpdateExpression', Name: 'b', Condition: '', Value: 'b++'},
                {Line: '15', Type: 'AssignmentExpression', Name: 'c', Condition: '', Value: 'c+3'},
                {Line: '17', Type: 'ReturnStatement', Name: '', Condition: '', Value: '-1'}  ]
        );
    });
});
