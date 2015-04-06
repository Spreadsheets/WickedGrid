//option parserClass:Formula
/* description: Parses end evaluates mathematical expressions. */
/* lexical grammar */
%lex
DOUBLE_QUOTED_STRING                ["]("\\"["]|[^"])*["]
SINGLE_QUOTED_STRING                [']('\\'[']|[^'])*[']
ESCAPED_DOUBLE_QUOTED_STRING        [\\]["].+?[\\]["]
ESCAPED_SINGLE_QUOTED_STRING        [\\]['].+?[\\][']

STRING                              [A-Za-z0-9]+

%%
\s+									{/* skip whitespace */}

([A-Za-z]{1,})([A-Za-z_0-9]+)?(?=[(])
									{return 'FUNCTION';}
([0]?[1-9]|1[0-2])[:][0-5][0-9]([:][0-5][0-9])?[ ]?(AM|am|aM|Am|PM|pm|pM|Pm)
									{return 'TIME_AMPM';}
([0]?[0-9]|1[0-9]|2[0-3])[:][0-5][0-9]([:][0-5][0-9])?
									{return 'TIME_24';}

({STRING})(?=[!]) {
	return 'SHEET';
}
({SINGLE_QUOTED_STRING}|{DOUBLE_QUOTED_STRING})(?=[!]) {
    //js
        yytext = yytext.substring(1, yytext.length - 1);
        return 'SHEET';

    /*php
        $yytext = substr($yytext, 1, -1);
        return 'SHEET';
    */
}
({SINGLE_QUOTED_STRING})			{return 'STRING';}
({DOUBLE_QUOTED_STRING})			{return 'STRING';}
({ESCAPED_SINGLE_QUOTED_STRING})	{return 'ESCAPED_STRING';}
({ESCAPED_DOUBLE_QUOTED_STRING})	{return 'ESCAPED_STRING';}

[A-Z]+(?=[0-9$])                    {return 'LETTERS';}
[A-Za-z]{1,}[A-Za-z_0-9]+   		{return 'VARIABLE';}
[A-Za-z_]+           				{return 'VARIABLE';}
[0-9]+          			  		{return 'NUMBER';}
"$"									{return '$';}
"&"                                 {return '&';}
" "									{return ' ';}
[.]									{return 'DECIMAL';}
":"									{return ':';}
";"									{return ';';}
","									{return ',';}
"*" 								{return '*';}
"/" 								{return '/';}
"-" 								{return '-';}
"+" 								{return '+';}
"^" 								{return '^';}
"(" 								{return '(';}
")" 								{return ')';}
">" 								{return '>';}
"<" 								{return '<';}
"PI"								{return 'PI';}
"E"									{return 'E';}
'"'									{return '"';}
"'"									{return "'";}
'\"'								{return '\"';}
"\'"								{return "\'";}
"!"									{return "!";}
"="									{return '=';}
"%"									{return '%';}
'#REF!'                             {return 'REF';}
[#]									{return '#';}
<<EOF>>								{return 'EOF';}


/lex

/* operator associations and precedence (low-top, high- bottom) */
%left '='
%left '<=' '>=' '<>' '||'
%left '>' '<'
%left '+' '-'
%left '*' '/'
%left '^'
%left '%'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
    : EOF {
        return null;
    }
    | expression EOF {
    	var types = yy.types;
    	yy.types = [];
        return types;
    }
;

expression
    : variableSequence {
        //js

			var type = {
		    	t: 'm',
		    	m: 'variable',
		    	a: [$1]
		    };
		    $$ = yy.types.length;
		    yy.types.push(type);

        /*php
            $$ = $this->variable($1);
        */
    }
	| TIME_AMPM {
	    //js

            var type = {
            	t: 'm',
                m: 'time',
            	a: [$1, true]
            };
            $$ = yy.types.length;
            yy.types.push(type);
        //
    }
	| TIME_24 {
        //js
            
            var type = {
            	t: 'm',
                m: 'time',
            	a: [$1]
            };
            $$ = yy.types.length;
            yy.types.push(type);
        //

    }
	| number {
	    //js
	        
            var type = {
            	t: 'm',
            	m: 'number',
            	a: [$1]
            };
            $$ = yy.types.length;
			yy.types.push(type);

        /*php
            $$ = $1 * 1;
        */
    }
	| STRING {
        //js
            
            var type = {
            	t: 'v',
            	v: yy.escape($1.substring(1, $1.length - 1))
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
	        $$ = substr($1, 1, -1);
        */
    }
    | ESCAPED_STRING {
        //js

            var type = {
            	t: 'v',
            	v: yy.escape($1.substring(2, $1.length - 2))
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = substr($1, 2, -2);
        */
    }
    | LETTERS {
        var type = {
        	t: 'v',
        	v: $1
        };
        yy.types.push(type);
    }
    | expression '&' expression {
        //js
            
            var type = {
            	t: 'm',
            	m: 'concatenate',
            	a: [$1, $3]
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = $1 . '' . $3;
        */
    }
	| expression '=' expression {
	    //js
	        
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['EQUAL', [$1, $3]]
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = $1 == $3;
        */
    }
	| expression '+' expression {
	    //js

			var type = {
				t: 'm',
				m: 'performMath',
				a: ['+', $1, $3]
			};
			$$ = yy.types.length;
			yy.types.push(type);

        /*php
			if (is_numeric($1) && is_numeric($3)) {
			   $$ = $1 + $3;
			} else {
			   $$ = $1 . $3;
			}
        */
    }
	| '(' expression ')' {
	    //js
	        
	        $$ = $2;
        //
	}
	| expression '<' '=' expression {
        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['LESS_EQUAL', [$1, $4]]
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = ($1 * 1) <= ($4 * 1);
        */
    }
    | expression '>' '=' expression {
        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['GREATER_EQUAL', [$1, $4]]
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = ($1 * 1) >= ($4 * 1);
        */
    }
	| expression '<' '>' expression {
		//js

			var type = {
				t: 'm',
				m: 'not',
				a: [$1, $4]
			};
			$$ = yy.types.length;
			yy.types.push(type);

		/*php
        	$$ = ($1) != ($4);
		*/
    }
	| expression '>' expression {
	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: ['GREATER', [$1, $3]]
			};
			$$ = yy.types.length;
			yy.types.push(type);

		/*php
		    $$ = ($1 * 1) > ($3 * 1);
        */
    }
	| expression '<' expression {
        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['LESS', [$1, $3]]
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = ($1 * 1) < ($3 * 1);
        */
    }
	| expression '-' expression {
        //js
            
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['-', $1, $3]
			};
			$$ = yy.types.length;
			yy.types.push(type);

        /*php
            $$ = ($1 * 1) - ($3 * 1);
        */
    }
	| expression '*' expression {
	    //js
	        
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['*', $1, $3]
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = ($1 * 1) * ($3 * 1);
        */
    }
	| expression '/' expression {
	    //js
	        
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['/', $1, $3]
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = ($1 * 1) / ($3 * 1);
        */
    }
	| expression '^' expression {
        //js

            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['^', $1, $3]
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = pow(($1 * 1), ($3 * 1));
        */
    }
	| '-' expression {
		//js

			var type = {
				t: 'm',
				m: 'invertNumber',
				a: [$2]
			};
			$$ = yy.types.length;
			yy.types.push(type);

        /*php
            $$ = $1 * 1;
        */
	}
	| '+' expression {
	    //js

	        var type = {
	        	t: 'm',
				m: 'number',
				a: [$2]
	        };
	        $$ = yy.types.length;
	        yy.types.push(type);

        /*php
            $$ = $1 * 1;
        */
	}
	| E {/*$$ = Math.E;*/;}
	| FUNCTION '(' ')' {
	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: [$1]
			};
			$$ = yy.types.length;
			yy.types.push(type);

		/*php
		    $$ = $this->callFunction($1);
        */
    }
	| FUNCTION '(' expseq ')' {
	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: [$1, $3]
			};
			$$ = yy.types.length;
			yy.types.push(type);

        /*php
            $$ = $this->callFunction($1, $3);
        */
    }
	| cellRange
;

cellRange :
	cell {
	    //js
	        
			var type = {
				t: 'l',
				m: 'cellValue',
				a: [$1]
			};
			$$ = yy.types.length;
			yy.types.push(type);

        /*php
            $$ = $this->cellValue($1);
        */
    }
	| cell ':' cell {
	    //js

			var type = {
				t: 'l',
				m: 'cellRangeValue',
				a: [$1, $3]
			};
			$$ = yy.types.length;
			yy.types.push(type);

        /*php
            $$ = $this->cellRangeValue($1, $3);
        */
    }
	| SHEET '!' cell {
	    //js
			var type = {
				t: 'l',
				m: 'remoteCellValue',
				a: [$1, $3]
			};
			$$ = yy.types.length;
			yy.types.push(type);

        /*php
            $$ = $this->remoteCellValue($1, $3);
        */
    }
	| SHEET '!' cell ':' cell {
	    //js
            var type = {
            	t: 'l',
            	m: 'remoteCellRangeValue',
            	a: [$1, $3, $5]
            };
            $$ = yy.types.length;
            yy.types.push(type);

        /*php
            $$ = $this->remoteCellRangeValue($1, $3, $5);
        */
    }
;

cell
	//valid first
	: LETTERS NUMBER {
		//js
			var type = {
				t: 'cell',
				c: $1,
				r: $2
			};
			$$ = yy.types.length;
			yy.types.push(type);
	}
	| '$' LETTERS NUMBER {
		//js
            var type = {
            	t: 'cell',
                c: $2,
                r: $3
            };
            $$ = yy.types.length;
            yy.types.push(type);
	}
	| LETTERS '$' NUMBER {
        //js
            var type = {
            	t: 'cell',
                c: $1,
                r: $3
            };
            $$ = yy.types.length;
            yy.types.push(type);
    }
	| '$' LETTERS '$' NUMBER {
        //js
            var type = {
            	t: 'cell',
                c: $2,
                r: $4
            };
            $$ = yy.types.length;
            yy.types.push(type);
    }

	//invalid
	| REF {return '#REF!';}
	| REF NUMBER {return '#REF!';}
	| LETTERS REF {return '#REF!';}
	| REF REF {return '#REF!';}

	//invalid
    | '$' REF NUMBER {return '#REF!';}
    | '$' LETTERS REF {return '#REF!';}
    | '$' REF REF {return '#REF!';}

	//invalid
    | REF '$' NUMBER {return '#REF!';}
    | LETTERS '$' REF {return '#REF!';}
    | REF '$' REF {return '#REF!';}

	//invalid
	| '$' REF '$' NUMBER {return '#REF!';}
    | '$' LETTERS '$' NUMBER {return '#REF!';}
    | '$' REF '$' REF {return '#REF!';}
;

expseq :
	expression {
	    //js
            $$ = [$1];

        /*php
            $$ = array($1);
        */
    }
    | expseq ';'
    | expseq ','
	| expseq ';' expression {
	    //js
	        $1.push($3);
	        $$ = $1;

        /*php
            $1[] = $3;
            $$ = $1;
        */
    }
 	| expseq ',' expression {
 	    //js
	        $1.push($3);
	        $$ = $1;

        /*php
			$1[] = $3;
			$$ = $1;
        */
    }
 ;


variableSequence :
	VARIABLE {
        $$ = [$1];
    }
	| variableSequence DECIMAL VARIABLE {
        //js
            $$ = ($1 instanceof Array ? $1 : [$1]);
            $$.push($3);

        /*php
            $$ = (is_array($1) ? $1 : array());
            $$[] = $3;
        */
    }
;

number :
	NUMBER {
        $$ = $1;
    }
	| NUMBER DECIMAL NUMBER {
        //js
            $$ = $1 + '.' + $3;

        /*php
            $$ = $1 . '.' . $3;
        */
    }
	| number '%' {
		//js
        	$$ = ($1 * 0.01) + '';

        /*php
        	$$ = ($1 * 0.01) . '';
        */
    }
;

%%
var Formula = function() {
	var formulaLexer = function () {};
	formulaLexer.prototype = parser.lexer;

	var formulaParser = function () {
		this.lexer = new formulaLexer();
		this.yy = {
			types: [],
			escape: function(value) {
				return value
					.replace(/&/gi, '&amp;')
					.replace(/>/gi, '&gt;')
					.replace(/</gi, '&lt;')
					.replace(/\n/g, '\n<br>')
					.replace(/\t/g, '&nbsp;&nbsp;&nbsp ')
					.replace(/  /g, '&nbsp; ');
			},
			parseError: function(msg, hash) {
				this.done = true;
				var result = new String();
				result.html = '<pre>' + msg + '</pre>';
				result.hash = hash;
				return result;
			}
		};
	};

	formulaParser.prototype = parser;
	var newParser = new formulaParser();
	return newParser;
};
if (typeof(window) !== 'undefined') {
	window.Formula = Formula;
} else {
	parser.Formula = Formula;
}