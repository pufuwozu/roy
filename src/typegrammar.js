var sys = require('sys'),
    Parser = require('jison').Parser;

var bnf = {
    // For type annotations
    "type": [
        ["IDENTIFIER optTypeParamList", "$$ = new yy.TypeName($1, $2);"],
        ["FUNCTION ( optTypeFunctionArgList )", "$$ = new yy.TypeFunction($3);"],
        ["GENERIC", "$$ = new yy.Generic($1);"],
        ["{ optTypePairs }", "$$ = new yy.TypeObject($2);"]
    ],
    "optTypeParamList": [
        ["", "$$ = [];"],
        ["typeParamList", "$$ = $1;"]
    ],
    "typeParamList": [
        ["IDENTIFIER", "$$ = [new yy.TypeName($1, [])];"],
        ["GENERIC", "$$ = [new yy.Generic($1, [])];"],
        ["( type )", "$$ = [$2];"],
        ["typeParamList IDENTIFIER", "$$ = $1; $1.push(new yy.TypeName($2, []));"],
        ["typeParamList GENERIC", "$$ = $1; $1.push(new yy.Generic($2, []));"],
        ["typeParamList ( type )", "$$ = $1; $1.push($3);"]
    ],
    "optTypeFunctionArgList": [
        ["", "$$ = [];"],
        ["typeFunctionArgList", "$$ = $1;"]
    ],
    "typeFunctionArgList": [
        ["type", "$$ = [$1];"],
        ["typeFunctionArgList , type", "$$ = $1; $1.push($3);"]
    ],
    "optTypePairs": [
        ["", "$$ = {};"],
        ["keywordOrIdentifier : type", "$$ = {}; $$[$1] = $3;"],
        ["optTypePairs , keywordOrIdentifier : type", "$$ = $1; $1[$3] = $5;"]
    ],
    "keywordOrIdentifier": [
        ["THEN", "$$ = $1;"],
        ["ELSE", "$$ = $1;"],
        ["DATA", "$$ = $1;"],
        ["TYPE", "$$ = $1;"],
        ["MATCH", "$$ = $1;"],
        ["CASE", "$$ = $1;"],
        ["DO", "$$ = $1;"],
        ["RETURN", "$$ = $1;"],
        ["MACRO", "$$ = $1;"],
        ["WITH", "$$ = $1;"],
        ["IDENTIFIER", "$$ = $1;"]
    ]
};

exports.bnf = bnf;

var grammar = {
    "startSymbol": "typefile",

    "bnf": {
        "typefile": [
            ["EOF", "return {};"],
            ["body EOF", "return $1;"]
        ],
        "body": [
            ["IDENTIFIER : type", "$$ = {}; $$[$1] = $3;"],
            ["body TERMINATOR IDENTIFIER : type", "$$ = $1; $1[$3] = $5;"],
            ["body TERMINATOR", "$$ = $1;"]
        ],

        "type": bnf.type,
        "optTypeParamList": bnf.optTypeParamList,
        "typeParamList": bnf.typeParamList,
        "optTypeFunctionArgList": bnf.optTypeFunctionArgList,
        "typeFunctionArgList": bnf.typeFunctionArgList,
        "optTypePairs": bnf.optTypePairs,
        "keywordOrIdentifier": bnf.keywordOrIdentifier
    }
};

if(exports && !module.parent) {
    var parser = new Parser(grammar, {debug: true});

    var fs = require('fs');
    fs.writeFile('src/typeparser.js', parser.generate());
}
