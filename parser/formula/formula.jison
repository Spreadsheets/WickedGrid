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
	//js
		if (yy.obj.typeName == 'Sheet.Cell') return 'SHEET';
		return 'VARIABLE';

	/*php
		if ($this->typeName == 'Sheet.Cell') return 'SHEET';
		return 'VARIABLE';
	*/
}
({SINGLE_QUOTED_STRING}|{DOUBLE_QUOTED_STRING})(?=[!]) {
    //js
        yytext = yytext.substring(1, yytext.length - 1);
        if (yy.obj.typeName == 'Sheet.Cell') return 'SHEET';
        return 'VARIABLE';

    /*php
        $yytext = substr($yytext, 1, -1);
        if ($this->typeName == 'Sheet.Cell') return 'SHEET';
        return 'VARIABLE';
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
"NOT"								{return 'NOT';}
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
%left '<=' '>=' '<>' 'NOT' '||'
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
        return $1;
    }
;

expression
    : variableSequence {
        //js
            
		    $$ = yy.handler.variable.apply(yy.obj, $1);

        /*php
            $$ = $this->variable($1);
        */
    }
	| TIME_AMPM {
	    //js
	        
            $$ = yy.handler.time($1, true);
        //
    }
	| TIME_24 {
        //js
            
            $$ = yy.handler.time($1);
        //

    }
	| number {
	    //js
	        
            $$ = yy.handler.number($1);

        /*php
            $$ = $1 * 1;
        */
    }
	| STRING {
        //js
            
            $$ = $1.substring(1, $1.length - 1);
        /*php
	        $$ = substr($1, 1, -1);
        */
    }
    | ESCAPED_STRING {
        //js

            $$ = $1.substring(2, $1.length - 2);
        /*php
            $$ = substr($1, 2, -2);
        */
    }
    | LETTERS {
        $$ = $1;
    }
    | expression '&' expression {
        //js
            
            $$ = $1.toString() + $3.toString();

        /*php
            $$ = $1 . '' . $3;
        */
    }
	| expression '=' expression {
	    //js
	        
            $$ = yy.handler.callFunction(yy.obj, 'EQUAL', [$1, $3]);

        /*php
            $$ = $1 == $3;
        */
    }
	| expression '+' expression {
	    //js

			$$ = yy.handler.performMath('+', $1, $3);

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
	        
	        $$ = yy.handler.number($2);
        //
	}
	| expression '<' '=' expression {
        //js
            
            $$ = yy.handler.callFunction(yy.obj, 'LESS_EQUAL', [$1, $4]);

        /*php
            $$ = ($1 * 1) <= ($4 * 1);
        */
    }
    | expression '>' '=' expression {
        //js
            
            $$ = yy.handler.callFunction(yy.obj, 'GREATER_EQUAL', [$1, $4]);

        /*php
            $$ = ($1 * 1) >= ($4 * 1);
        */
    }
	| expression '<' '>' expression {
        $$ = ($1) != ($4);

        //js
            
			if (isNaN($$)) {
			    $$ = 0;
			}
        //
    }
	| expression NOT expression {
		
        $$ = $1 != $3;
    }
	| expression '>' expression {
	    //js
	        
			$$ = yy.handler.callFunction(yy.obj, 'GREATER', [$1, $3]);

		/*php
		    $$ = ($1 * 1) > ($3 * 1);
        */
    }
	| expression '<' expression {
        //js
            
            $$ = yy.handler.callFunction(yy.obj, 'LESS', [$1, $3]);

        /*php
            $$ = ($1 * 1) < ($3 * 1);
        */
    }
	| expression '-' expression {
        //js
            
            $$ = yy.handler.performMath('-', $1, $3);

        /*php
            $$ = ($1 * 1) - ($3 * 1);
        */
    }
	| expression '*' expression {
	    //js
	        
            $$ = yy.handler.performMath('*', $1, $3);

        /*php
            $$ = ($1 * 1) * ($3 * 1);
        */
    }
	| expression '/' expression {
	    //js
	        
            $$ = yy.handler.performMath('/', $1, $3);

        /*php
            $$ = ($1 * 1) / ($3 * 1);
        */
    }
	| expression '^' expression {
        //js
            
            var n1 = yy.handler.number($1),
                n2 = yy.handler.number($3);

            $$ = yy.handler.performMath('^', $1, $3);

        /*php
            $$ = pow(($1 * 1), ($3 * 1));
        */
    }
	| '-' expression {
		//js
			
			var n1 = yy.handler.numberInverted($2);
			$$ = n1;
			if (isNaN($$)) {
			    $$ = 0;
			}

        /*php
            $$ = $1 * 1;
        */
		}
	| '+' expression {
	    //js
	        
			var n1 = yy.handler.number($2);
			$$ = n1;
			if (isNaN($$)) {
			    $$ = 0;
			}

        /*php
            $$ = $1 * 1;
        */
		}
	| E {/*$$ = Math.E;*/;}
	| FUNCTION '(' ')' {
	    //js
	        
			$$ = yy.handler.callFunction(yy.obj, $1);

		/*php
		    $$ = $this->callFunction($1);
        */
    }
	| FUNCTION '(' expseq ')' {
	    //js
	        
			$$ = yy.handler.callFunction(yy.obj, $1, $3);

        /*php
            $$ = $this->callFunction($1, $3);
        */
    }
	| cellRange
;

cellRange :
	cell {
	    //js
	        
			$$ = yy.handler.cellValue(yy.obj, $1);

        /*php
            $$ = $this->cellValue($1);
        */
    }
	| cell ':' cell {
	    //js
			$$ = yy.handler.cellRangeValue(yy.obj, $1, $3);

        /*php
            $$ = $this->cellRangeValue($1, $3);
        */
    }
	| SHEET '!' cell {
	    //js
			$$ = yy.handler.remoteCellValue(yy.obj, $1, $3);

        /*php
            $$ = $this->remoteCellValue($1, $3);
        */
    }
	| SHEET '!' cell ':' cell {
	    //js
            $$ = yy.handler.remoteCellRangeValue(yy.obj, $1, $3, $5);

        /*php
            $$ = $this->remoteCellRangeValue($1, $3, $5);
        */
    }
;

cell
	//valid first
	: LETTERS NUMBER {
		//js
			$$ = {
				colString: $1,
				rowString: $2
			};
	}
	| '$' LETTERS NUMBER {
		//js
            $$ = {
                colString: $2,
                rowString: $3
            };
	}
	| LETTERS '$' NUMBER {
        //js
            $$ = {
                colString: $1,
                rowString: $3
            };
    }
	| '$' LETTERS '$' NUMBER {
        //js
            $$ = {
                colString: $2,
                rowString: $4
            };
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
            $$ = ($.isArray($1) ? $1 : [$1]);
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
            $$ = ($1 + '.' + $3) * 1;

        /*php
            $$ = $1 . '.' . $3;
        */
    }
	| number '%' {
        $$ = $1 * 0.01;
    }
;

%%
if (typeof(window) !== 'undefined') {
	window.Formula = function(handler) {
		var formulaLexer = function () {};
		formulaLexer.prototype = parser.lexer;

		var formulaParser = function () {
			this.lexer = new formulaLexer();
			this.yy = {
				parseError: function(msg, hash) {
					this.done = true;
					var result = new String();
					result.html = '<pre>' + msg + '</pre>';
					result.hash = hash;
					return result;
				},
				lexerError: function(msg, hash) {
					this.done = true;
					var result = new String();
					result.html = '<pre>' + msg + '</pre>';
                    result.hash = hash;
                    return result;
				}
			};
		};

		formulaParser.prototype = parser;
		var newParser = new formulaParser;
		newParser.setObj = function(obj) {
			newParser.yy.obj = obj;
		};
		newParser.yy.handler = handler;
		return newParser;
	};
}