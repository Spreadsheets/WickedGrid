<?php
/* Jison generated parser */
namespace Jison;
use Exception;




class formula
{
    public $symbols = array();
    public $terminals = array();
    public $productions = array();
    public $table = array();
    public $defaultActions = array();
    public $version = '0.3.12';
    public $debug = false;
    public $none = 0;
    public $shift = 1;
    public $reduce = 2;
    public $accept = 3;
    public $unputStack = array();

    function trace()
    {

    }

    function __construct()
    {
        //Setup Parser
        
			$symbol0 = new ParserSymbol("accept", 0);
			$symbol1 = new ParserSymbol("end", 1);
			$symbol2 = new ParserSymbol("error", 2);
			$symbol3 = new ParserSymbol("expressions", 3);
			$symbol4 = new ParserSymbol("EOF", 4);
			$symbol5 = new ParserSymbol("expression", 5);
			$symbol6 = new ParserSymbol("variableSequence", 6);
			$symbol7 = new ParserSymbol("TIME_AMPM", 7);
			$symbol8 = new ParserSymbol("TIME_24", 8);
			$symbol9 = new ParserSymbol("number", 9);
			$symbol10 = new ParserSymbol("STRING", 10);
			$symbol11 = new ParserSymbol("ESCAPED_STRING", 11);
			$symbol12 = new ParserSymbol("LETTERS", 12);
			$symbol13 = new ParserSymbol("&", 13);
			$symbol14 = new ParserSymbol("=", 14);
			$symbol15 = new ParserSymbol("+", 15);
			$symbol16 = new ParserSymbol("(", 16);
			$symbol17 = new ParserSymbol(")", 17);
			$symbol18 = new ParserSymbol("<", 18);
			$symbol19 = new ParserSymbol(">", 19);
			$symbol20 = new ParserSymbol("-", 20);
			$symbol21 = new ParserSymbol("*", 21);
			$symbol22 = new ParserSymbol("/", 22);
			$symbol23 = new ParserSymbol("^", 23);
			$symbol24 = new ParserSymbol("E", 24);
			$symbol25 = new ParserSymbol("FUNCTION", 25);
			$symbol26 = new ParserSymbol("expseq", 26);
			$symbol27 = new ParserSymbol("cellRange", 27);
			$symbol28 = new ParserSymbol("cell", 28);
			$symbol29 = new ParserSymbol(":", 29);
			$symbol30 = new ParserSymbol("SHEET", 30);
			$symbol31 = new ParserSymbol("!", 31);
			$symbol32 = new ParserSymbol("NUMBER", 32);
			$symbol33 = new ParserSymbol("", 33);
			$symbol34 = new ParserSymbol("REF", 34);
			$symbol35 = new ParserSymbol(";", 35);
			$symbol36 = new ParserSymbol(",", 36);
			$symbol37 = new ParserSymbol("VARIABLE", 37);
			$symbol38 = new ParserSymbol("DECIMAL", 38);
			$symbol39 = new ParserSymbol("%", 39);
			$this->symbols[0] = $symbol0;
			$this->symbols["accept"] = $symbol0;
			$this->symbols[1] = $symbol1;
			$this->symbols["end"] = $symbol1;
			$this->symbols[2] = $symbol2;
			$this->symbols["error"] = $symbol2;
			$this->symbols[3] = $symbol3;
			$this->symbols["expressions"] = $symbol3;
			$this->symbols[4] = $symbol4;
			$this->symbols["EOF"] = $symbol4;
			$this->symbols[5] = $symbol5;
			$this->symbols["expression"] = $symbol5;
			$this->symbols[6] = $symbol6;
			$this->symbols["variableSequence"] = $symbol6;
			$this->symbols[7] = $symbol7;
			$this->symbols["TIME_AMPM"] = $symbol7;
			$this->symbols[8] = $symbol8;
			$this->symbols["TIME_24"] = $symbol8;
			$this->symbols[9] = $symbol9;
			$this->symbols["number"] = $symbol9;
			$this->symbols[10] = $symbol10;
			$this->symbols["STRING"] = $symbol10;
			$this->symbols[11] = $symbol11;
			$this->symbols["ESCAPED_STRING"] = $symbol11;
			$this->symbols[12] = $symbol12;
			$this->symbols["LETTERS"] = $symbol12;
			$this->symbols[13] = $symbol13;
			$this->symbols["&"] = $symbol13;
			$this->symbols[14] = $symbol14;
			$this->symbols["="] = $symbol14;
			$this->symbols[15] = $symbol15;
			$this->symbols["+"] = $symbol15;
			$this->symbols[16] = $symbol16;
			$this->symbols["("] = $symbol16;
			$this->symbols[17] = $symbol17;
			$this->symbols[")"] = $symbol17;
			$this->symbols[18] = $symbol18;
			$this->symbols["<"] = $symbol18;
			$this->symbols[19] = $symbol19;
			$this->symbols[">"] = $symbol19;
			$this->symbols[20] = $symbol20;
			$this->symbols["-"] = $symbol20;
			$this->symbols[21] = $symbol21;
			$this->symbols["*"] = $symbol21;
			$this->symbols[22] = $symbol22;
			$this->symbols["/"] = $symbol22;
			$this->symbols[23] = $symbol23;
			$this->symbols["^"] = $symbol23;
			$this->symbols[24] = $symbol24;
			$this->symbols["E"] = $symbol24;
			$this->symbols[25] = $symbol25;
			$this->symbols["FUNCTION"] = $symbol25;
			$this->symbols[26] = $symbol26;
			$this->symbols["expseq"] = $symbol26;
			$this->symbols[27] = $symbol27;
			$this->symbols["cellRange"] = $symbol27;
			$this->symbols[28] = $symbol28;
			$this->symbols["cell"] = $symbol28;
			$this->symbols[29] = $symbol29;
			$this->symbols[":"] = $symbol29;
			$this->symbols[30] = $symbol30;
			$this->symbols["SHEET"] = $symbol30;
			$this->symbols[31] = $symbol31;
			$this->symbols["!"] = $symbol31;
			$this->symbols[32] = $symbol32;
			$this->symbols["NUMBER"] = $symbol32;
			$this->symbols[33] = $symbol33;
			$this->symbols[""] = $symbol33;
			$this->symbols[34] = $symbol34;
			$this->symbols["REF"] = $symbol34;
			$this->symbols[35] = $symbol35;
			$this->symbols[";"] = $symbol35;
			$this->symbols[36] = $symbol36;
			$this->symbols[","] = $symbol36;
			$this->symbols[37] = $symbol37;
			$this->symbols["VARIABLE"] = $symbol37;
			$this->symbols[38] = $symbol38;
			$this->symbols["DECIMAL"] = $symbol38;
			$this->symbols[39] = $symbol39;
			$this->symbols["%"] = $symbol39;

			$this->terminals = array(
					2=>&$symbol2,
					4=>&$symbol4,
					7=>&$symbol7,
					8=>&$symbol8,
					10=>&$symbol10,
					11=>&$symbol11,
					12=>&$symbol12,
					13=>&$symbol13,
					14=>&$symbol14,
					15=>&$symbol15,
					16=>&$symbol16,
					17=>&$symbol17,
					18=>&$symbol18,
					19=>&$symbol19,
					20=>&$symbol20,
					21=>&$symbol21,
					22=>&$symbol22,
					23=>&$symbol23,
					24=>&$symbol24,
					25=>&$symbol25,
					29=>&$symbol29,
					30=>&$symbol30,
					31=>&$symbol31,
					32=>&$symbol32,
					33=>&$symbol33,
					34=>&$symbol34,
					35=>&$symbol35,
					36=>&$symbol36,
					37=>&$symbol37,
					38=>&$symbol38,
					39=>&$symbol39
				);

			$table0 = new ParserState(0);
			$table1 = new ParserState(1);
			$table2 = new ParserState(2);
			$table3 = new ParserState(3);
			$table4 = new ParserState(4);
			$table5 = new ParserState(5);
			$table6 = new ParserState(6);
			$table7 = new ParserState(7);
			$table8 = new ParserState(8);
			$table9 = new ParserState(9);
			$table10 = new ParserState(10);
			$table11 = new ParserState(11);
			$table12 = new ParserState(12);
			$table13 = new ParserState(13);
			$table14 = new ParserState(14);
			$table15 = new ParserState(15);
			$table16 = new ParserState(16);
			$table17 = new ParserState(17);
			$table18 = new ParserState(18);
			$table19 = new ParserState(19);
			$table20 = new ParserState(20);
			$table21 = new ParserState(21);
			$table22 = new ParserState(22);
			$table23 = new ParserState(23);
			$table24 = new ParserState(24);
			$table25 = new ParserState(25);
			$table26 = new ParserState(26);
			$table27 = new ParserState(27);
			$table28 = new ParserState(28);
			$table29 = new ParserState(29);
			$table30 = new ParserState(30);
			$table31 = new ParserState(31);
			$table32 = new ParserState(32);
			$table33 = new ParserState(33);
			$table34 = new ParserState(34);
			$table35 = new ParserState(35);
			$table36 = new ParserState(36);
			$table37 = new ParserState(37);
			$table38 = new ParserState(38);
			$table39 = new ParserState(39);
			$table40 = new ParserState(40);
			$table41 = new ParserState(41);
			$table42 = new ParserState(42);
			$table43 = new ParserState(43);
			$table44 = new ParserState(44);
			$table45 = new ParserState(45);
			$table46 = new ParserState(46);
			$table47 = new ParserState(47);
			$table48 = new ParserState(48);
			$table49 = new ParserState(49);
			$table50 = new ParserState(50);
			$table51 = new ParserState(51);
			$table52 = new ParserState(52);
			$table53 = new ParserState(53);
			$table54 = new ParserState(54);
			$table55 = new ParserState(55);
			$table56 = new ParserState(56);
			$table57 = new ParserState(57);
			$table58 = new ParserState(58);
			$table59 = new ParserState(59);
			$table60 = new ParserState(60);
			$table61 = new ParserState(61);
			$table62 = new ParserState(62);
			$table63 = new ParserState(63);
			$table64 = new ParserState(64);
			$table65 = new ParserState(65);
			$table66 = new ParserState(66);
			$table67 = new ParserState(67);
			$table68 = new ParserState(68);
			$table69 = new ParserState(69);
			$table70 = new ParserState(70);
			$table71 = new ParserState(71);
			$table72 = new ParserState(72);
			$table73 = new ParserState(73);
			$table74 = new ParserState(74);
			$table75 = new ParserState(75);
			$table76 = new ParserState(76);
			$table77 = new ParserState(77);
			$table78 = new ParserState(78);
			$table79 = new ParserState(79);
			$table80 = new ParserState(80);
			$table81 = new ParserState(81);
			$table82 = new ParserState(82);
			$table83 = new ParserState(83);
			$table84 = new ParserState(84);
			$table85 = new ParserState(85);
			$table86 = new ParserState(86);
			$table87 = new ParserState(87);
			$table88 = new ParserState(88);
			$table89 = new ParserState(89);
			$table90 = new ParserState(90);
			$table91 = new ParserState(91);
			$table92 = new ParserState(92);
			$table93 = new ParserState(93);

			$tableDefinition0 = array(
				
					3=>new ParserAction($this->none, $table1),
					4=>new ParserAction($this->shift, $table2),
					5=>new ParserAction($this->none, $table3),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition1 = array(
				
					1=>new ParserAction($this->accept)
				);

			$tableDefinition2 = array(
				
					1=>new ParserAction($this->reduce, $table1)
				);

			$tableDefinition3 = array(
				
					4=>new ParserAction($this->shift, $table23),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->shift, $table25),
					15=>new ParserAction($this->shift, $table26),
					18=>new ParserAction($this->shift, $table27),
					19=>new ParserAction($this->shift, $table28),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32)
				);

			$tableDefinition4 = array(
				
					4=>new ParserAction($this->reduce, $table3),
					13=>new ParserAction($this->reduce, $table3),
					14=>new ParserAction($this->reduce, $table3),
					15=>new ParserAction($this->reduce, $table3),
					17=>new ParserAction($this->reduce, $table3),
					18=>new ParserAction($this->reduce, $table3),
					19=>new ParserAction($this->reduce, $table3),
					20=>new ParserAction($this->reduce, $table3),
					21=>new ParserAction($this->reduce, $table3),
					22=>new ParserAction($this->reduce, $table3),
					23=>new ParserAction($this->reduce, $table3),
					35=>new ParserAction($this->reduce, $table3),
					36=>new ParserAction($this->reduce, $table3),
					38=>new ParserAction($this->shift, $table33)
				);

			$tableDefinition5 = array(
				
					4=>new ParserAction($this->reduce, $table4),
					13=>new ParserAction($this->reduce, $table4),
					14=>new ParserAction($this->reduce, $table4),
					15=>new ParserAction($this->reduce, $table4),
					17=>new ParserAction($this->reduce, $table4),
					18=>new ParserAction($this->reduce, $table4),
					19=>new ParserAction($this->reduce, $table4),
					20=>new ParserAction($this->reduce, $table4),
					21=>new ParserAction($this->reduce, $table4),
					22=>new ParserAction($this->reduce, $table4),
					23=>new ParserAction($this->reduce, $table4),
					35=>new ParserAction($this->reduce, $table4),
					36=>new ParserAction($this->reduce, $table4)
				);

			$tableDefinition6 = array(
				
					4=>new ParserAction($this->reduce, $table5),
					13=>new ParserAction($this->reduce, $table5),
					14=>new ParserAction($this->reduce, $table5),
					15=>new ParserAction($this->reduce, $table5),
					17=>new ParserAction($this->reduce, $table5),
					18=>new ParserAction($this->reduce, $table5),
					19=>new ParserAction($this->reduce, $table5),
					20=>new ParserAction($this->reduce, $table5),
					21=>new ParserAction($this->reduce, $table5),
					22=>new ParserAction($this->reduce, $table5),
					23=>new ParserAction($this->reduce, $table5),
					35=>new ParserAction($this->reduce, $table5),
					36=>new ParserAction($this->reduce, $table5)
				);

			$tableDefinition7 = array(
				
					4=>new ParserAction($this->reduce, $table6),
					13=>new ParserAction($this->reduce, $table6),
					14=>new ParserAction($this->reduce, $table6),
					15=>new ParserAction($this->reduce, $table6),
					17=>new ParserAction($this->reduce, $table6),
					18=>new ParserAction($this->reduce, $table6),
					19=>new ParserAction($this->reduce, $table6),
					20=>new ParserAction($this->reduce, $table6),
					21=>new ParserAction($this->reduce, $table6),
					22=>new ParserAction($this->reduce, $table6),
					23=>new ParserAction($this->reduce, $table6),
					35=>new ParserAction($this->reduce, $table6),
					36=>new ParserAction($this->reduce, $table6),
					39=>new ParserAction($this->shift, $table34)
				);

			$tableDefinition8 = array(
				
					4=>new ParserAction($this->reduce, $table7),
					13=>new ParserAction($this->reduce, $table7),
					14=>new ParserAction($this->reduce, $table7),
					15=>new ParserAction($this->reduce, $table7),
					17=>new ParserAction($this->reduce, $table7),
					18=>new ParserAction($this->reduce, $table7),
					19=>new ParserAction($this->reduce, $table7),
					20=>new ParserAction($this->reduce, $table7),
					21=>new ParserAction($this->reduce, $table7),
					22=>new ParserAction($this->reduce, $table7),
					23=>new ParserAction($this->reduce, $table7),
					35=>new ParserAction($this->reduce, $table7),
					36=>new ParserAction($this->reduce, $table7)
				);

			$tableDefinition9 = array(
				
					4=>new ParserAction($this->reduce, $table8),
					13=>new ParserAction($this->reduce, $table8),
					14=>new ParserAction($this->reduce, $table8),
					15=>new ParserAction($this->reduce, $table8),
					17=>new ParserAction($this->reduce, $table8),
					18=>new ParserAction($this->reduce, $table8),
					19=>new ParserAction($this->reduce, $table8),
					20=>new ParserAction($this->reduce, $table8),
					21=>new ParserAction($this->reduce, $table8),
					22=>new ParserAction($this->reduce, $table8),
					23=>new ParserAction($this->reduce, $table8),
					35=>new ParserAction($this->reduce, $table8),
					36=>new ParserAction($this->reduce, $table8)
				);

			$tableDefinition10 = array(
				
					4=>new ParserAction($this->reduce, $table9),
					13=>new ParserAction($this->reduce, $table9),
					14=>new ParserAction($this->reduce, $table9),
					15=>new ParserAction($this->reduce, $table9),
					17=>new ParserAction($this->reduce, $table9),
					18=>new ParserAction($this->reduce, $table9),
					19=>new ParserAction($this->reduce, $table9),
					20=>new ParserAction($this->reduce, $table9),
					21=>new ParserAction($this->reduce, $table9),
					22=>new ParserAction($this->reduce, $table9),
					23=>new ParserAction($this->reduce, $table9),
					32=>new ParserAction($this->shift, $table35),
					33=>new ParserAction($this->shift, $table36),
					34=>new ParserAction($this->shift, $table37),
					35=>new ParserAction($this->reduce, $table9),
					36=>new ParserAction($this->reduce, $table9)
				);

			$tableDefinition11 = array(
				
					5=>new ParserAction($this->none, $table38),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition12 = array(
				
					5=>new ParserAction($this->none, $table39),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition13 = array(
				
					5=>new ParserAction($this->none, $table40),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition14 = array(
				
					4=>new ParserAction($this->reduce, $table25),
					13=>new ParserAction($this->reduce, $table25),
					14=>new ParserAction($this->reduce, $table25),
					15=>new ParserAction($this->reduce, $table25),
					17=>new ParserAction($this->reduce, $table25),
					18=>new ParserAction($this->reduce, $table25),
					19=>new ParserAction($this->reduce, $table25),
					20=>new ParserAction($this->reduce, $table25),
					21=>new ParserAction($this->reduce, $table25),
					22=>new ParserAction($this->reduce, $table25),
					23=>new ParserAction($this->reduce, $table25),
					35=>new ParserAction($this->reduce, $table25),
					36=>new ParserAction($this->reduce, $table25)
				);

			$tableDefinition15 = array(
				
					16=>new ParserAction($this->shift, $table41)
				);

			$tableDefinition16 = array(
				
					4=>new ParserAction($this->reduce, $table28),
					13=>new ParserAction($this->reduce, $table28),
					14=>new ParserAction($this->reduce, $table28),
					15=>new ParserAction($this->reduce, $table28),
					17=>new ParserAction($this->reduce, $table28),
					18=>new ParserAction($this->reduce, $table28),
					19=>new ParserAction($this->reduce, $table28),
					20=>new ParserAction($this->reduce, $table28),
					21=>new ParserAction($this->reduce, $table28),
					22=>new ParserAction($this->reduce, $table28),
					23=>new ParserAction($this->reduce, $table28),
					35=>new ParserAction($this->reduce, $table28),
					36=>new ParserAction($this->reduce, $table28)
				);

			$tableDefinition17 = array(
				
					4=>new ParserAction($this->reduce, $table55),
					13=>new ParserAction($this->reduce, $table55),
					14=>new ParserAction($this->reduce, $table55),
					15=>new ParserAction($this->reduce, $table55),
					17=>new ParserAction($this->reduce, $table55),
					18=>new ParserAction($this->reduce, $table55),
					19=>new ParserAction($this->reduce, $table55),
					20=>new ParserAction($this->reduce, $table55),
					21=>new ParserAction($this->reduce, $table55),
					22=>new ParserAction($this->reduce, $table55),
					23=>new ParserAction($this->reduce, $table55),
					35=>new ParserAction($this->reduce, $table55),
					36=>new ParserAction($this->reduce, $table55),
					38=>new ParserAction($this->reduce, $table55)
				);

			$tableDefinition18 = array(
				
					4=>new ParserAction($this->reduce, $table57),
					13=>new ParserAction($this->reduce, $table57),
					14=>new ParserAction($this->reduce, $table57),
					15=>new ParserAction($this->reduce, $table57),
					17=>new ParserAction($this->reduce, $table57),
					18=>new ParserAction($this->reduce, $table57),
					19=>new ParserAction($this->reduce, $table57),
					20=>new ParserAction($this->reduce, $table57),
					21=>new ParserAction($this->reduce, $table57),
					22=>new ParserAction($this->reduce, $table57),
					23=>new ParserAction($this->reduce, $table57),
					35=>new ParserAction($this->reduce, $table57),
					36=>new ParserAction($this->reduce, $table57),
					38=>new ParserAction($this->shift, $table42),
					39=>new ParserAction($this->reduce, $table57)
				);

			$tableDefinition19 = array(
				
					4=>new ParserAction($this->reduce, $table29),
					13=>new ParserAction($this->reduce, $table29),
					14=>new ParserAction($this->reduce, $table29),
					15=>new ParserAction($this->reduce, $table29),
					17=>new ParserAction($this->reduce, $table29),
					18=>new ParserAction($this->reduce, $table29),
					19=>new ParserAction($this->reduce, $table29),
					20=>new ParserAction($this->reduce, $table29),
					21=>new ParserAction($this->reduce, $table29),
					22=>new ParserAction($this->reduce, $table29),
					23=>new ParserAction($this->reduce, $table29),
					29=>new ParserAction($this->shift, $table43),
					35=>new ParserAction($this->reduce, $table29),
					36=>new ParserAction($this->reduce, $table29)
				);

			$tableDefinition20 = array(
				
					31=>new ParserAction($this->shift, $table44)
				);

			$tableDefinition21 = array(
				
					12=>new ParserAction($this->shift, $table45),
					34=>new ParserAction($this->shift, $table46)
				);

			$tableDefinition22 = array(
				
					4=>new ParserAction($this->reduce, $table37),
					13=>new ParserAction($this->reduce, $table37),
					14=>new ParserAction($this->reduce, $table37),
					15=>new ParserAction($this->reduce, $table37),
					17=>new ParserAction($this->reduce, $table37),
					18=>new ParserAction($this->reduce, $table37),
					19=>new ParserAction($this->reduce, $table37),
					20=>new ParserAction($this->reduce, $table37),
					21=>new ParserAction($this->reduce, $table37),
					22=>new ParserAction($this->reduce, $table37),
					23=>new ParserAction($this->reduce, $table37),
					29=>new ParserAction($this->reduce, $table37),
					32=>new ParserAction($this->shift, $table47),
					33=>new ParserAction($this->shift, $table49),
					34=>new ParserAction($this->shift, $table48),
					35=>new ParserAction($this->reduce, $table37),
					36=>new ParserAction($this->reduce, $table37)
				);

			$tableDefinition23 = array(
				
					1=>new ParserAction($this->reduce, $table2)
				);

			$tableDefinition24 = array(
				
					5=>new ParserAction($this->none, $table50),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition25 = array(
				
					5=>new ParserAction($this->none, $table51),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition26 = array(
				
					5=>new ParserAction($this->none, $table52),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition27 = array(
				
					5=>new ParserAction($this->none, $table55),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					14=>new ParserAction($this->shift, $table53),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					19=>new ParserAction($this->shift, $table54),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition28 = array(
				
					5=>new ParserAction($this->none, $table57),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					14=>new ParserAction($this->shift, $table56),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition29 = array(
				
					5=>new ParserAction($this->none, $table58),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition30 = array(
				
					5=>new ParserAction($this->none, $table59),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition31 = array(
				
					5=>new ParserAction($this->none, $table60),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition32 = array(
				
					5=>new ParserAction($this->none, $table61),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition33 = array(
				
					37=>new ParserAction($this->shift, $table62)
				);

			$tableDefinition34 = array(
				
					4=>new ParserAction($this->reduce, $table59),
					13=>new ParserAction($this->reduce, $table59),
					14=>new ParserAction($this->reduce, $table59),
					15=>new ParserAction($this->reduce, $table59),
					17=>new ParserAction($this->reduce, $table59),
					18=>new ParserAction($this->reduce, $table59),
					19=>new ParserAction($this->reduce, $table59),
					20=>new ParserAction($this->reduce, $table59),
					21=>new ParserAction($this->reduce, $table59),
					22=>new ParserAction($this->reduce, $table59),
					23=>new ParserAction($this->reduce, $table59),
					35=>new ParserAction($this->reduce, $table59),
					36=>new ParserAction($this->reduce, $table59),
					39=>new ParserAction($this->reduce, $table59)
				);

			$tableDefinition35 = array(
				
					4=>new ParserAction($this->reduce, $table33),
					13=>new ParserAction($this->reduce, $table33),
					14=>new ParserAction($this->reduce, $table33),
					15=>new ParserAction($this->reduce, $table33),
					17=>new ParserAction($this->reduce, $table33),
					18=>new ParserAction($this->reduce, $table33),
					19=>new ParserAction($this->reduce, $table33),
					20=>new ParserAction($this->reduce, $table33),
					21=>new ParserAction($this->reduce, $table33),
					22=>new ParserAction($this->reduce, $table33),
					23=>new ParserAction($this->reduce, $table33),
					29=>new ParserAction($this->reduce, $table33),
					35=>new ParserAction($this->reduce, $table33),
					36=>new ParserAction($this->reduce, $table33)
				);

			$tableDefinition36 = array(
				
					32=>new ParserAction($this->shift, $table63),
					34=>new ParserAction($this->shift, $table64)
				);

			$tableDefinition37 = array(
				
					4=>new ParserAction($this->reduce, $table39),
					13=>new ParserAction($this->reduce, $table39),
					14=>new ParserAction($this->reduce, $table39),
					15=>new ParserAction($this->reduce, $table39),
					17=>new ParserAction($this->reduce, $table39),
					18=>new ParserAction($this->reduce, $table39),
					19=>new ParserAction($this->reduce, $table39),
					20=>new ParserAction($this->reduce, $table39),
					21=>new ParserAction($this->reduce, $table39),
					22=>new ParserAction($this->reduce, $table39),
					23=>new ParserAction($this->reduce, $table39),
					29=>new ParserAction($this->reduce, $table39),
					35=>new ParserAction($this->reduce, $table39),
					36=>new ParserAction($this->reduce, $table39)
				);

			$tableDefinition38 = array(
				
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->shift, $table25),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->shift, $table65),
					18=>new ParserAction($this->shift, $table27),
					19=>new ParserAction($this->shift, $table28),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32)
				);

			$tableDefinition39 = array(
				
					4=>new ParserAction($this->reduce, $table23),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table23),
					15=>new ParserAction($this->reduce, $table23),
					17=>new ParserAction($this->reduce, $table23),
					18=>new ParserAction($this->reduce, $table23),
					19=>new ParserAction($this->reduce, $table23),
					20=>new ParserAction($this->reduce, $table23),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table23),
					36=>new ParserAction($this->reduce, $table23)
				);

			$tableDefinition40 = array(
				
					4=>new ParserAction($this->reduce, $table24),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table24),
					15=>new ParserAction($this->reduce, $table24),
					17=>new ParserAction($this->reduce, $table24),
					18=>new ParserAction($this->reduce, $table24),
					19=>new ParserAction($this->reduce, $table24),
					20=>new ParserAction($this->reduce, $table24),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table24),
					36=>new ParserAction($this->reduce, $table24)
				);

			$tableDefinition41 = array(
				
					5=>new ParserAction($this->none, $table68),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					17=>new ParserAction($this->shift, $table66),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					26=>new ParserAction($this->none, $table67),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition42 = array(
				
					32=>new ParserAction($this->shift, $table69)
				);

			$tableDefinition43 = array(
				
					12=>new ParserAction($this->shift, $table71),
					28=>new ParserAction($this->none, $table70),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22)
				);

			$tableDefinition44 = array(
				
					12=>new ParserAction($this->shift, $table71),
					28=>new ParserAction($this->none, $table72),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22)
				);

			$tableDefinition45 = array(
				
					32=>new ParserAction($this->shift, $table73),
					33=>new ParserAction($this->shift, $table74),
					34=>new ParserAction($this->shift, $table75)
				);

			$tableDefinition46 = array(
				
					32=>new ParserAction($this->shift, $table76),
					33=>new ParserAction($this->shift, $table78),
					34=>new ParserAction($this->shift, $table77)
				);

			$tableDefinition47 = array(
				
					4=>new ParserAction($this->reduce, $table38),
					13=>new ParserAction($this->reduce, $table38),
					14=>new ParserAction($this->reduce, $table38),
					15=>new ParserAction($this->reduce, $table38),
					17=>new ParserAction($this->reduce, $table38),
					18=>new ParserAction($this->reduce, $table38),
					19=>new ParserAction($this->reduce, $table38),
					20=>new ParserAction($this->reduce, $table38),
					21=>new ParserAction($this->reduce, $table38),
					22=>new ParserAction($this->reduce, $table38),
					23=>new ParserAction($this->reduce, $table38),
					29=>new ParserAction($this->reduce, $table38),
					35=>new ParserAction($this->reduce, $table38),
					36=>new ParserAction($this->reduce, $table38)
				);

			$tableDefinition48 = array(
				
					4=>new ParserAction($this->reduce, $table40),
					13=>new ParserAction($this->reduce, $table40),
					14=>new ParserAction($this->reduce, $table40),
					15=>new ParserAction($this->reduce, $table40),
					17=>new ParserAction($this->reduce, $table40),
					18=>new ParserAction($this->reduce, $table40),
					19=>new ParserAction($this->reduce, $table40),
					20=>new ParserAction($this->reduce, $table40),
					21=>new ParserAction($this->reduce, $table40),
					22=>new ParserAction($this->reduce, $table40),
					23=>new ParserAction($this->reduce, $table40),
					29=>new ParserAction($this->reduce, $table40),
					35=>new ParserAction($this->reduce, $table40),
					36=>new ParserAction($this->reduce, $table40)
				);

			$tableDefinition49 = array(
				
					32=>new ParserAction($this->shift, $table79),
					34=>new ParserAction($this->shift, $table80)
				);

			$tableDefinition50 = array(
				
					4=>new ParserAction($this->reduce, $table10),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->shift, $table25),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table10),
					18=>new ParserAction($this->shift, $table27),
					19=>new ParserAction($this->shift, $table28),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table10),
					36=>new ParserAction($this->reduce, $table10)
				);

			$tableDefinition51 = array(
				
					4=>new ParserAction($this->reduce, $table11),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table11),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table11),
					18=>new ParserAction($this->shift, $table27),
					19=>new ParserAction($this->shift, $table28),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table11),
					36=>new ParserAction($this->reduce, $table11)
				);

			$tableDefinition52 = array(
				
					4=>new ParserAction($this->reduce, $table12),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table12),
					15=>new ParserAction($this->reduce, $table12),
					17=>new ParserAction($this->reduce, $table12),
					18=>new ParserAction($this->reduce, $table12),
					19=>new ParserAction($this->reduce, $table12),
					20=>new ParserAction($this->reduce, $table12),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table12),
					36=>new ParserAction($this->reduce, $table12)
				);

			$tableDefinition53 = array(
				
					5=>new ParserAction($this->none, $table81),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition54 = array(
				
					5=>new ParserAction($this->none, $table82),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition55 = array(
				
					4=>new ParserAction($this->reduce, $table18),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table18),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table18),
					18=>new ParserAction($this->reduce, $table18),
					19=>new ParserAction($this->reduce, $table18),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table18),
					36=>new ParserAction($this->reduce, $table18)
				);

			$tableDefinition56 = array(
				
					5=>new ParserAction($this->none, $table83),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition57 = array(
				
					4=>new ParserAction($this->reduce, $table17),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table17),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table17),
					18=>new ParserAction($this->reduce, $table17),
					19=>new ParserAction($this->reduce, $table17),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table17),
					36=>new ParserAction($this->reduce, $table17)
				);

			$tableDefinition58 = array(
				
					4=>new ParserAction($this->reduce, $table19),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table19),
					15=>new ParserAction($this->reduce, $table19),
					17=>new ParserAction($this->reduce, $table19),
					18=>new ParserAction($this->reduce, $table19),
					19=>new ParserAction($this->reduce, $table19),
					20=>new ParserAction($this->reduce, $table19),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table19),
					36=>new ParserAction($this->reduce, $table19)
				);

			$tableDefinition59 = array(
				
					4=>new ParserAction($this->reduce, $table20),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table20),
					15=>new ParserAction($this->reduce, $table20),
					17=>new ParserAction($this->reduce, $table20),
					18=>new ParserAction($this->reduce, $table20),
					19=>new ParserAction($this->reduce, $table20),
					20=>new ParserAction($this->reduce, $table20),
					21=>new ParserAction($this->reduce, $table20),
					22=>new ParserAction($this->reduce, $table20),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table20),
					36=>new ParserAction($this->reduce, $table20)
				);

			$tableDefinition60 = array(
				
					4=>new ParserAction($this->reduce, $table21),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table21),
					15=>new ParserAction($this->reduce, $table21),
					17=>new ParserAction($this->reduce, $table21),
					18=>new ParserAction($this->reduce, $table21),
					19=>new ParserAction($this->reduce, $table21),
					20=>new ParserAction($this->reduce, $table21),
					21=>new ParserAction($this->reduce, $table21),
					22=>new ParserAction($this->reduce, $table21),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table21),
					36=>new ParserAction($this->reduce, $table21)
				);

			$tableDefinition61 = array(
				
					4=>new ParserAction($this->reduce, $table22),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table22),
					15=>new ParserAction($this->reduce, $table22),
					17=>new ParserAction($this->reduce, $table22),
					18=>new ParserAction($this->reduce, $table22),
					19=>new ParserAction($this->reduce, $table22),
					20=>new ParserAction($this->reduce, $table22),
					21=>new ParserAction($this->reduce, $table22),
					22=>new ParserAction($this->reduce, $table22),
					23=>new ParserAction($this->reduce, $table22),
					35=>new ParserAction($this->reduce, $table22),
					36=>new ParserAction($this->reduce, $table22)
				);

			$tableDefinition62 = array(
				
					4=>new ParserAction($this->reduce, $table56),
					13=>new ParserAction($this->reduce, $table56),
					14=>new ParserAction($this->reduce, $table56),
					15=>new ParserAction($this->reduce, $table56),
					17=>new ParserAction($this->reduce, $table56),
					18=>new ParserAction($this->reduce, $table56),
					19=>new ParserAction($this->reduce, $table56),
					20=>new ParserAction($this->reduce, $table56),
					21=>new ParserAction($this->reduce, $table56),
					22=>new ParserAction($this->reduce, $table56),
					23=>new ParserAction($this->reduce, $table56),
					35=>new ParserAction($this->reduce, $table56),
					36=>new ParserAction($this->reduce, $table56),
					38=>new ParserAction($this->reduce, $table56)
				);

			$tableDefinition63 = array(
				
					4=>new ParserAction($this->reduce, $table35),
					13=>new ParserAction($this->reduce, $table35),
					14=>new ParserAction($this->reduce, $table35),
					15=>new ParserAction($this->reduce, $table35),
					17=>new ParserAction($this->reduce, $table35),
					18=>new ParserAction($this->reduce, $table35),
					19=>new ParserAction($this->reduce, $table35),
					20=>new ParserAction($this->reduce, $table35),
					21=>new ParserAction($this->reduce, $table35),
					22=>new ParserAction($this->reduce, $table35),
					23=>new ParserAction($this->reduce, $table35),
					29=>new ParserAction($this->reduce, $table35),
					35=>new ParserAction($this->reduce, $table35),
					36=>new ParserAction($this->reduce, $table35)
				);

			$tableDefinition64 = array(
				
					4=>new ParserAction($this->reduce, $table45),
					13=>new ParserAction($this->reduce, $table45),
					14=>new ParserAction($this->reduce, $table45),
					15=>new ParserAction($this->reduce, $table45),
					17=>new ParserAction($this->reduce, $table45),
					18=>new ParserAction($this->reduce, $table45),
					19=>new ParserAction($this->reduce, $table45),
					20=>new ParserAction($this->reduce, $table45),
					21=>new ParserAction($this->reduce, $table45),
					22=>new ParserAction($this->reduce, $table45),
					23=>new ParserAction($this->reduce, $table45),
					29=>new ParserAction($this->reduce, $table45),
					35=>new ParserAction($this->reduce, $table45),
					36=>new ParserAction($this->reduce, $table45)
				);

			$tableDefinition65 = array(
				
					4=>new ParserAction($this->reduce, $table13),
					13=>new ParserAction($this->reduce, $table13),
					14=>new ParserAction($this->reduce, $table13),
					15=>new ParserAction($this->reduce, $table13),
					17=>new ParserAction($this->reduce, $table13),
					18=>new ParserAction($this->reduce, $table13),
					19=>new ParserAction($this->reduce, $table13),
					20=>new ParserAction($this->reduce, $table13),
					21=>new ParserAction($this->reduce, $table13),
					22=>new ParserAction($this->reduce, $table13),
					23=>new ParserAction($this->reduce, $table13),
					35=>new ParserAction($this->reduce, $table13),
					36=>new ParserAction($this->reduce, $table13)
				);

			$tableDefinition66 = array(
				
					4=>new ParserAction($this->reduce, $table26),
					13=>new ParserAction($this->reduce, $table26),
					14=>new ParserAction($this->reduce, $table26),
					15=>new ParserAction($this->reduce, $table26),
					17=>new ParserAction($this->reduce, $table26),
					18=>new ParserAction($this->reduce, $table26),
					19=>new ParserAction($this->reduce, $table26),
					20=>new ParserAction($this->reduce, $table26),
					21=>new ParserAction($this->reduce, $table26),
					22=>new ParserAction($this->reduce, $table26),
					23=>new ParserAction($this->reduce, $table26),
					35=>new ParserAction($this->reduce, $table26),
					36=>new ParserAction($this->reduce, $table26)
				);

			$tableDefinition67 = array(
				
					17=>new ParserAction($this->shift, $table84),
					35=>new ParserAction($this->shift, $table85),
					36=>new ParserAction($this->shift, $table86)
				);

			$tableDefinition68 = array(
				
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->shift, $table25),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table50),
					18=>new ParserAction($this->shift, $table27),
					19=>new ParserAction($this->shift, $table28),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table50),
					36=>new ParserAction($this->reduce, $table50)
				);

			$tableDefinition69 = array(
				
					4=>new ParserAction($this->reduce, $table58),
					13=>new ParserAction($this->reduce, $table58),
					14=>new ParserAction($this->reduce, $table58),
					15=>new ParserAction($this->reduce, $table58),
					17=>new ParserAction($this->reduce, $table58),
					18=>new ParserAction($this->reduce, $table58),
					19=>new ParserAction($this->reduce, $table58),
					20=>new ParserAction($this->reduce, $table58),
					21=>new ParserAction($this->reduce, $table58),
					22=>new ParserAction($this->reduce, $table58),
					23=>new ParserAction($this->reduce, $table58),
					35=>new ParserAction($this->reduce, $table58),
					36=>new ParserAction($this->reduce, $table58),
					39=>new ParserAction($this->reduce, $table58)
				);

			$tableDefinition70 = array(
				
					4=>new ParserAction($this->reduce, $table30),
					13=>new ParserAction($this->reduce, $table30),
					14=>new ParserAction($this->reduce, $table30),
					15=>new ParserAction($this->reduce, $table30),
					17=>new ParserAction($this->reduce, $table30),
					18=>new ParserAction($this->reduce, $table30),
					19=>new ParserAction($this->reduce, $table30),
					20=>new ParserAction($this->reduce, $table30),
					21=>new ParserAction($this->reduce, $table30),
					22=>new ParserAction($this->reduce, $table30),
					23=>new ParserAction($this->reduce, $table30),
					35=>new ParserAction($this->reduce, $table30),
					36=>new ParserAction($this->reduce, $table30)
				);

			$tableDefinition71 = array(
				
					32=>new ParserAction($this->shift, $table35),
					33=>new ParserAction($this->shift, $table36),
					34=>new ParserAction($this->shift, $table37)
				);

			$tableDefinition72 = array(
				
					4=>new ParserAction($this->reduce, $table31),
					13=>new ParserAction($this->reduce, $table31),
					14=>new ParserAction($this->reduce, $table31),
					15=>new ParserAction($this->reduce, $table31),
					17=>new ParserAction($this->reduce, $table31),
					18=>new ParserAction($this->reduce, $table31),
					19=>new ParserAction($this->reduce, $table31),
					20=>new ParserAction($this->reduce, $table31),
					21=>new ParserAction($this->reduce, $table31),
					22=>new ParserAction($this->reduce, $table31),
					23=>new ParserAction($this->reduce, $table31),
					29=>new ParserAction($this->shift, $table87),
					35=>new ParserAction($this->reduce, $table31),
					36=>new ParserAction($this->reduce, $table31)
				);

			$tableDefinition73 = array(
				
					4=>new ParserAction($this->reduce, $table34),
					13=>new ParserAction($this->reduce, $table34),
					14=>new ParserAction($this->reduce, $table34),
					15=>new ParserAction($this->reduce, $table34),
					17=>new ParserAction($this->reduce, $table34),
					18=>new ParserAction($this->reduce, $table34),
					19=>new ParserAction($this->reduce, $table34),
					20=>new ParserAction($this->reduce, $table34),
					21=>new ParserAction($this->reduce, $table34),
					22=>new ParserAction($this->reduce, $table34),
					23=>new ParserAction($this->reduce, $table34),
					29=>new ParserAction($this->reduce, $table34),
					35=>new ParserAction($this->reduce, $table34),
					36=>new ParserAction($this->reduce, $table34)
				);

			$tableDefinition74 = array(
				
					32=>new ParserAction($this->shift, $table88)
				);

			$tableDefinition75 = array(
				
					4=>new ParserAction($this->reduce, $table42),
					13=>new ParserAction($this->reduce, $table42),
					14=>new ParserAction($this->reduce, $table42),
					15=>new ParserAction($this->reduce, $table42),
					17=>new ParserAction($this->reduce, $table42),
					18=>new ParserAction($this->reduce, $table42),
					19=>new ParserAction($this->reduce, $table42),
					20=>new ParserAction($this->reduce, $table42),
					21=>new ParserAction($this->reduce, $table42),
					22=>new ParserAction($this->reduce, $table42),
					23=>new ParserAction($this->reduce, $table42),
					29=>new ParserAction($this->reduce, $table42),
					35=>new ParserAction($this->reduce, $table42),
					36=>new ParserAction($this->reduce, $table42)
				);

			$tableDefinition76 = array(
				
					4=>new ParserAction($this->reduce, $table41),
					13=>new ParserAction($this->reduce, $table41),
					14=>new ParserAction($this->reduce, $table41),
					15=>new ParserAction($this->reduce, $table41),
					17=>new ParserAction($this->reduce, $table41),
					18=>new ParserAction($this->reduce, $table41),
					19=>new ParserAction($this->reduce, $table41),
					20=>new ParserAction($this->reduce, $table41),
					21=>new ParserAction($this->reduce, $table41),
					22=>new ParserAction($this->reduce, $table41),
					23=>new ParserAction($this->reduce, $table41),
					29=>new ParserAction($this->reduce, $table41),
					35=>new ParserAction($this->reduce, $table41),
					36=>new ParserAction($this->reduce, $table41)
				);

			$tableDefinition77 = array(
				
					4=>new ParserAction($this->reduce, $table43),
					13=>new ParserAction($this->reduce, $table43),
					14=>new ParserAction($this->reduce, $table43),
					15=>new ParserAction($this->reduce, $table43),
					17=>new ParserAction($this->reduce, $table43),
					18=>new ParserAction($this->reduce, $table43),
					19=>new ParserAction($this->reduce, $table43),
					20=>new ParserAction($this->reduce, $table43),
					21=>new ParserAction($this->reduce, $table43),
					22=>new ParserAction($this->reduce, $table43),
					23=>new ParserAction($this->reduce, $table43),
					29=>new ParserAction($this->reduce, $table43),
					35=>new ParserAction($this->reduce, $table43),
					36=>new ParserAction($this->reduce, $table43)
				);

			$tableDefinition78 = array(
				
					32=>new ParserAction($this->shift, $table89),
					34=>new ParserAction($this->shift, $table90)
				);

			$tableDefinition79 = array(
				
					4=>new ParserAction($this->reduce, $table44),
					13=>new ParserAction($this->reduce, $table44),
					14=>new ParserAction($this->reduce, $table44),
					15=>new ParserAction($this->reduce, $table44),
					17=>new ParserAction($this->reduce, $table44),
					18=>new ParserAction($this->reduce, $table44),
					19=>new ParserAction($this->reduce, $table44),
					20=>new ParserAction($this->reduce, $table44),
					21=>new ParserAction($this->reduce, $table44),
					22=>new ParserAction($this->reduce, $table44),
					23=>new ParserAction($this->reduce, $table44),
					29=>new ParserAction($this->reduce, $table44),
					35=>new ParserAction($this->reduce, $table44),
					36=>new ParserAction($this->reduce, $table44)
				);

			$tableDefinition80 = array(
				
					4=>new ParserAction($this->reduce, $table46),
					13=>new ParserAction($this->reduce, $table46),
					14=>new ParserAction($this->reduce, $table46),
					15=>new ParserAction($this->reduce, $table46),
					17=>new ParserAction($this->reduce, $table46),
					18=>new ParserAction($this->reduce, $table46),
					19=>new ParserAction($this->reduce, $table46),
					20=>new ParserAction($this->reduce, $table46),
					21=>new ParserAction($this->reduce, $table46),
					22=>new ParserAction($this->reduce, $table46),
					23=>new ParserAction($this->reduce, $table46),
					29=>new ParserAction($this->reduce, $table46),
					35=>new ParserAction($this->reduce, $table46),
					36=>new ParserAction($this->reduce, $table46)
				);

			$tableDefinition81 = array(
				
					4=>new ParserAction($this->reduce, $table14),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table14),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table14),
					18=>new ParserAction($this->reduce, $table14),
					19=>new ParserAction($this->reduce, $table14),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table14),
					36=>new ParserAction($this->reduce, $table14)
				);

			$tableDefinition82 = array(
				
					4=>new ParserAction($this->reduce, $table16),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table16),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table16),
					18=>new ParserAction($this->reduce, $table16),
					19=>new ParserAction($this->reduce, $table16),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table16),
					36=>new ParserAction($this->reduce, $table16)
				);

			$tableDefinition83 = array(
				
					4=>new ParserAction($this->reduce, $table15),
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->reduce, $table15),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table15),
					18=>new ParserAction($this->reduce, $table15),
					19=>new ParserAction($this->reduce, $table15),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table15),
					36=>new ParserAction($this->reduce, $table15)
				);

			$tableDefinition84 = array(
				
					4=>new ParserAction($this->reduce, $table27),
					13=>new ParserAction($this->reduce, $table27),
					14=>new ParserAction($this->reduce, $table27),
					15=>new ParserAction($this->reduce, $table27),
					17=>new ParserAction($this->reduce, $table27),
					18=>new ParserAction($this->reduce, $table27),
					19=>new ParserAction($this->reduce, $table27),
					20=>new ParserAction($this->reduce, $table27),
					21=>new ParserAction($this->reduce, $table27),
					22=>new ParserAction($this->reduce, $table27),
					23=>new ParserAction($this->reduce, $table27),
					35=>new ParserAction($this->reduce, $table27),
					36=>new ParserAction($this->reduce, $table27)
				);

			$tableDefinition85 = array(
				
					5=>new ParserAction($this->none, $table91),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					17=>new ParserAction($this->reduce, $table51),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					35=>new ParserAction($this->reduce, $table51),
					36=>new ParserAction($this->reduce, $table51),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition86 = array(
				
					5=>new ParserAction($this->none, $table92),
					6=>new ParserAction($this->none, $table4),
					7=>new ParserAction($this->shift, $table5),
					8=>new ParserAction($this->shift, $table6),
					9=>new ParserAction($this->none, $table7),
					10=>new ParserAction($this->shift, $table8),
					11=>new ParserAction($this->shift, $table9),
					12=>new ParserAction($this->shift, $table10),
					15=>new ParserAction($this->shift, $table13),
					16=>new ParserAction($this->shift, $table11),
					17=>new ParserAction($this->reduce, $table52),
					20=>new ParserAction($this->shift, $table12),
					24=>new ParserAction($this->shift, $table14),
					25=>new ParserAction($this->shift, $table15),
					27=>new ParserAction($this->none, $table16),
					28=>new ParserAction($this->none, $table19),
					30=>new ParserAction($this->shift, $table20),
					32=>new ParserAction($this->shift, $table18),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22),
					35=>new ParserAction($this->reduce, $table52),
					36=>new ParserAction($this->reduce, $table52),
					37=>new ParserAction($this->shift, $table17)
				);

			$tableDefinition87 = array(
				
					12=>new ParserAction($this->shift, $table71),
					28=>new ParserAction($this->none, $table93),
					33=>new ParserAction($this->shift, $table21),
					34=>new ParserAction($this->shift, $table22)
				);

			$tableDefinition88 = array(
				
					4=>new ParserAction($this->reduce, $table36),
					13=>new ParserAction($this->reduce, $table36),
					14=>new ParserAction($this->reduce, $table36),
					15=>new ParserAction($this->reduce, $table36),
					17=>new ParserAction($this->reduce, $table36),
					18=>new ParserAction($this->reduce, $table36),
					19=>new ParserAction($this->reduce, $table36),
					20=>new ParserAction($this->reduce, $table36),
					21=>new ParserAction($this->reduce, $table36),
					22=>new ParserAction($this->reduce, $table36),
					23=>new ParserAction($this->reduce, $table36),
					29=>new ParserAction($this->reduce, $table36),
					35=>new ParserAction($this->reduce, $table36),
					36=>new ParserAction($this->reduce, $table36)
				);

			$tableDefinition89 = array(
				
					4=>new ParserAction($this->reduce, $table47),
					13=>new ParserAction($this->reduce, $table47),
					14=>new ParserAction($this->reduce, $table47),
					15=>new ParserAction($this->reduce, $table47),
					17=>new ParserAction($this->reduce, $table47),
					18=>new ParserAction($this->reduce, $table47),
					19=>new ParserAction($this->reduce, $table47),
					20=>new ParserAction($this->reduce, $table47),
					21=>new ParserAction($this->reduce, $table47),
					22=>new ParserAction($this->reduce, $table47),
					23=>new ParserAction($this->reduce, $table47),
					29=>new ParserAction($this->reduce, $table47),
					35=>new ParserAction($this->reduce, $table47),
					36=>new ParserAction($this->reduce, $table47)
				);

			$tableDefinition90 = array(
				
					4=>new ParserAction($this->reduce, $table49),
					13=>new ParserAction($this->reduce, $table49),
					14=>new ParserAction($this->reduce, $table49),
					15=>new ParserAction($this->reduce, $table49),
					17=>new ParserAction($this->reduce, $table49),
					18=>new ParserAction($this->reduce, $table49),
					19=>new ParserAction($this->reduce, $table49),
					20=>new ParserAction($this->reduce, $table49),
					21=>new ParserAction($this->reduce, $table49),
					22=>new ParserAction($this->reduce, $table49),
					23=>new ParserAction($this->reduce, $table49),
					29=>new ParserAction($this->reduce, $table49),
					35=>new ParserAction($this->reduce, $table49),
					36=>new ParserAction($this->reduce, $table49)
				);

			$tableDefinition91 = array(
				
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->shift, $table25),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table53),
					18=>new ParserAction($this->shift, $table27),
					19=>new ParserAction($this->shift, $table28),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table53),
					36=>new ParserAction($this->reduce, $table53)
				);

			$tableDefinition92 = array(
				
					13=>new ParserAction($this->shift, $table24),
					14=>new ParserAction($this->shift, $table25),
					15=>new ParserAction($this->shift, $table26),
					17=>new ParserAction($this->reduce, $table54),
					18=>new ParserAction($this->shift, $table27),
					19=>new ParserAction($this->shift, $table28),
					20=>new ParserAction($this->shift, $table29),
					21=>new ParserAction($this->shift, $table30),
					22=>new ParserAction($this->shift, $table31),
					23=>new ParserAction($this->shift, $table32),
					35=>new ParserAction($this->reduce, $table54),
					36=>new ParserAction($this->reduce, $table54)
				);

			$tableDefinition93 = array(
				
					4=>new ParserAction($this->reduce, $table32),
					13=>new ParserAction($this->reduce, $table32),
					14=>new ParserAction($this->reduce, $table32),
					15=>new ParserAction($this->reduce, $table32),
					17=>new ParserAction($this->reduce, $table32),
					18=>new ParserAction($this->reduce, $table32),
					19=>new ParserAction($this->reduce, $table32),
					20=>new ParserAction($this->reduce, $table32),
					21=>new ParserAction($this->reduce, $table32),
					22=>new ParserAction($this->reduce, $table32),
					23=>new ParserAction($this->reduce, $table32),
					35=>new ParserAction($this->reduce, $table32),
					36=>new ParserAction($this->reduce, $table32)
				);

			$table0->setActions($tableDefinition0);
			$table1->setActions($tableDefinition1);
			$table2->setActions($tableDefinition2);
			$table3->setActions($tableDefinition3);
			$table4->setActions($tableDefinition4);
			$table5->setActions($tableDefinition5);
			$table6->setActions($tableDefinition6);
			$table7->setActions($tableDefinition7);
			$table8->setActions($tableDefinition8);
			$table9->setActions($tableDefinition9);
			$table10->setActions($tableDefinition10);
			$table11->setActions($tableDefinition11);
			$table12->setActions($tableDefinition12);
			$table13->setActions($tableDefinition13);
			$table14->setActions($tableDefinition14);
			$table15->setActions($tableDefinition15);
			$table16->setActions($tableDefinition16);
			$table17->setActions($tableDefinition17);
			$table18->setActions($tableDefinition18);
			$table19->setActions($tableDefinition19);
			$table20->setActions($tableDefinition20);
			$table21->setActions($tableDefinition21);
			$table22->setActions($tableDefinition22);
			$table23->setActions($tableDefinition23);
			$table24->setActions($tableDefinition24);
			$table25->setActions($tableDefinition25);
			$table26->setActions($tableDefinition26);
			$table27->setActions($tableDefinition27);
			$table28->setActions($tableDefinition28);
			$table29->setActions($tableDefinition29);
			$table30->setActions($tableDefinition30);
			$table31->setActions($tableDefinition31);
			$table32->setActions($tableDefinition32);
			$table33->setActions($tableDefinition33);
			$table34->setActions($tableDefinition34);
			$table35->setActions($tableDefinition35);
			$table36->setActions($tableDefinition36);
			$table37->setActions($tableDefinition37);
			$table38->setActions($tableDefinition38);
			$table39->setActions($tableDefinition39);
			$table40->setActions($tableDefinition40);
			$table41->setActions($tableDefinition41);
			$table42->setActions($tableDefinition42);
			$table43->setActions($tableDefinition43);
			$table44->setActions($tableDefinition44);
			$table45->setActions($tableDefinition45);
			$table46->setActions($tableDefinition46);
			$table47->setActions($tableDefinition47);
			$table48->setActions($tableDefinition48);
			$table49->setActions($tableDefinition49);
			$table50->setActions($tableDefinition50);
			$table51->setActions($tableDefinition51);
			$table52->setActions($tableDefinition52);
			$table53->setActions($tableDefinition53);
			$table54->setActions($tableDefinition54);
			$table55->setActions($tableDefinition55);
			$table56->setActions($tableDefinition56);
			$table57->setActions($tableDefinition57);
			$table58->setActions($tableDefinition58);
			$table59->setActions($tableDefinition59);
			$table60->setActions($tableDefinition60);
			$table61->setActions($tableDefinition61);
			$table62->setActions($tableDefinition62);
			$table63->setActions($tableDefinition63);
			$table64->setActions($tableDefinition64);
			$table65->setActions($tableDefinition65);
			$table66->setActions($tableDefinition66);
			$table67->setActions($tableDefinition67);
			$table68->setActions($tableDefinition68);
			$table69->setActions($tableDefinition69);
			$table70->setActions($tableDefinition70);
			$table71->setActions($tableDefinition71);
			$table72->setActions($tableDefinition72);
			$table73->setActions($tableDefinition73);
			$table74->setActions($tableDefinition74);
			$table75->setActions($tableDefinition75);
			$table76->setActions($tableDefinition76);
			$table77->setActions($tableDefinition77);
			$table78->setActions($tableDefinition78);
			$table79->setActions($tableDefinition79);
			$table80->setActions($tableDefinition80);
			$table81->setActions($tableDefinition81);
			$table82->setActions($tableDefinition82);
			$table83->setActions($tableDefinition83);
			$table84->setActions($tableDefinition84);
			$table85->setActions($tableDefinition85);
			$table86->setActions($tableDefinition86);
			$table87->setActions($tableDefinition87);
			$table88->setActions($tableDefinition88);
			$table89->setActions($tableDefinition89);
			$table90->setActions($tableDefinition90);
			$table91->setActions($tableDefinition91);
			$table92->setActions($tableDefinition92);
			$table93->setActions($tableDefinition93);

			$this->table = array(
				
					0=>$table0,
					1=>$table1,
					2=>$table2,
					3=>$table3,
					4=>$table4,
					5=>$table5,
					6=>$table6,
					7=>$table7,
					8=>$table8,
					9=>$table9,
					10=>$table10,
					11=>$table11,
					12=>$table12,
					13=>$table13,
					14=>$table14,
					15=>$table15,
					16=>$table16,
					17=>$table17,
					18=>$table18,
					19=>$table19,
					20=>$table20,
					21=>$table21,
					22=>$table22,
					23=>$table23,
					24=>$table24,
					25=>$table25,
					26=>$table26,
					27=>$table27,
					28=>$table28,
					29=>$table29,
					30=>$table30,
					31=>$table31,
					32=>$table32,
					33=>$table33,
					34=>$table34,
					35=>$table35,
					36=>$table36,
					37=>$table37,
					38=>$table38,
					39=>$table39,
					40=>$table40,
					41=>$table41,
					42=>$table42,
					43=>$table43,
					44=>$table44,
					45=>$table45,
					46=>$table46,
					47=>$table47,
					48=>$table48,
					49=>$table49,
					50=>$table50,
					51=>$table51,
					52=>$table52,
					53=>$table53,
					54=>$table54,
					55=>$table55,
					56=>$table56,
					57=>$table57,
					58=>$table58,
					59=>$table59,
					60=>$table60,
					61=>$table61,
					62=>$table62,
					63=>$table63,
					64=>$table64,
					65=>$table65,
					66=>$table66,
					67=>$table67,
					68=>$table68,
					69=>$table69,
					70=>$table70,
					71=>$table71,
					72=>$table72,
					73=>$table73,
					74=>$table74,
					75=>$table75,
					76=>$table76,
					77=>$table77,
					78=>$table78,
					79=>$table79,
					80=>$table80,
					81=>$table81,
					82=>$table82,
					83=>$table83,
					84=>$table84,
					85=>$table85,
					86=>$table86,
					87=>$table87,
					88=>$table88,
					89=>$table89,
					90=>$table90,
					91=>$table91,
					92=>$table92,
					93=>$table93
				);

			$this->defaultActions = array(
				
					2=>new ParserAction($this->reduce, $table1),
					23=>new ParserAction($this->reduce, $table2)
				);

			$this->productions = array(
				
					0=>new ParserProduction($symbol0),
					1=>new ParserProduction($symbol3,1),
					2=>new ParserProduction($symbol3,2),
					3=>new ParserProduction($symbol5,1),
					4=>new ParserProduction($symbol5,1),
					5=>new ParserProduction($symbol5,1),
					6=>new ParserProduction($symbol5,1),
					7=>new ParserProduction($symbol5,1),
					8=>new ParserProduction($symbol5,1),
					9=>new ParserProduction($symbol5,1),
					10=>new ParserProduction($symbol5,3),
					11=>new ParserProduction($symbol5,3),
					12=>new ParserProduction($symbol5,3),
					13=>new ParserProduction($symbol5,3),
					14=>new ParserProduction($symbol5,4),
					15=>new ParserProduction($symbol5,4),
					16=>new ParserProduction($symbol5,4),
					17=>new ParserProduction($symbol5,3),
					18=>new ParserProduction($symbol5,3),
					19=>new ParserProduction($symbol5,3),
					20=>new ParserProduction($symbol5,3),
					21=>new ParserProduction($symbol5,3),
					22=>new ParserProduction($symbol5,3),
					23=>new ParserProduction($symbol5,2),
					24=>new ParserProduction($symbol5,2),
					25=>new ParserProduction($symbol5,1),
					26=>new ParserProduction($symbol5,3),
					27=>new ParserProduction($symbol5,4),
					28=>new ParserProduction($symbol5,1),
					29=>new ParserProduction($symbol27,1),
					30=>new ParserProduction($symbol27,3),
					31=>new ParserProduction($symbol27,3),
					32=>new ParserProduction($symbol27,5),
					33=>new ParserProduction($symbol28,2),
					34=>new ParserProduction($symbol28,3),
					35=>new ParserProduction($symbol28,3),
					36=>new ParserProduction($symbol28,4),
					37=>new ParserProduction($symbol28,1),
					38=>new ParserProduction($symbol28,2),
					39=>new ParserProduction($symbol28,2),
					40=>new ParserProduction($symbol28,2),
					41=>new ParserProduction($symbol28,3),
					42=>new ParserProduction($symbol28,3),
					43=>new ParserProduction($symbol28,3),
					44=>new ParserProduction($symbol28,3),
					45=>new ParserProduction($symbol28,3),
					46=>new ParserProduction($symbol28,3),
					47=>new ParserProduction($symbol28,4),
					48=>new ParserProduction($symbol28,4),
					49=>new ParserProduction($symbol28,4),
					50=>new ParserProduction($symbol26,1),
					51=>new ParserProduction($symbol26,2),
					52=>new ParserProduction($symbol26,2),
					53=>new ParserProduction($symbol26,3),
					54=>new ParserProduction($symbol26,3),
					55=>new ParserProduction($symbol6,1),
					56=>new ParserProduction($symbol6,3),
					57=>new ParserProduction($symbol9,1),
					58=>new ParserProduction($symbol9,3),
					59=>new ParserProduction($symbol9,2)
				);




        //Setup Lexer
        
			$this->rules = array(
				
					0=>"/\G(?:\s+)/",
					1=>"/\G(?:([A-Za-z]{1,})([A-Za-z_0-9]+)?(?=[(]))/",
					2=>"/\G(?:([0]?[1-9]|1[0-2])[:][0-5][0-9]([:][0-5][0-9])?[ ]?(AM|am|aM|Am|PM|pm|pM|Pm))/",
					3=>"/\G(?:([0]?[0-9]|1[0-9]|2[0-3])[:][0-5][0-9]([:][0-5][0-9])?)/",
					4=>"/\G(?:(([A-Za-z0-9]+))(?=[!]))/",
					5=>"/\G(?:((['](\\[']|[^'])*['])|([\"](\\[\"]|[^\"])*[\"]))(?=[!]))/",
					6=>"/\G(?:((['](\\[']|[^'])*['])))/",
					7=>"/\G(?:(([\"](\\[\"]|[^\"])*[\"])))/",
					8=>"/\G(?:(([\\]['].+?[\\]['])))/",
					9=>"/\G(?:(([\\][\"].+?[\\][\"])))/",
					10=>"/\G(?:[A-Z]+(?=[0-9$]))/",
					11=>"/\G(?:[A-Za-z]{1,}[A-Za-z_0-9]+)/",
					12=>"/\G(?:[A-Za-z_]+)/",
					13=>"/\G(?:[0-9]+)/",
					14=>"/\G(?:\$)/",
					15=>"/\G(?:&)/",
					16=>"/\G(?: )/",
					17=>"/\G(?:[.])/",
					18=>"/\G(?::)/",
					19=>"/\G(?:;)/",
					20=>"/\G(?:,)/",
					21=>"/\G(?:\*)/",
					22=>"/\G(?:\/)/",
					23=>"/\G(?:-)/",
					24=>"/\G(?:\+)/",
					25=>"/\G(?:\^)/",
					26=>"/\G(?:\()/",
					27=>"/\G(?:\))/",
					28=>"/\G(?:>)/",
					29=>"/\G(?:<)/",
					30=>"/\G(?:PI\b)/",
					31=>"/\G(?:E\b)/",
					32=>"/\G(?:\")/",
					33=>"/\G(?:')/",
					34=>"/\G(?:\\\")/",
					35=>"/\G(?:\\')/",
					36=>"/\G(?:!)/",
					37=>"/\G(?:=)/",
					38=>"/\G(?:%)/",
					39=>"/\G(?:#REF!)/",
					40=>"/\G(?:[#])/",
					41=>"/\G(?:$)/"
				);

			$this->conditions = array(
				
					"INITIAL"=>new LexerConditions(array( 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41), true)
				);


    }

    function parserPerformAction(&$thisS, &$yy, $yystate, &$s, $o)
    {
        
/* this == yyval */


switch ($yystate) {
case 1:

        return null;
    
break;
case 2:

    	var types = yy->types;
    	yy->types = [];
        return types;
    
break;
case 3:

        
            $thisS = $this->variable($s[$o]);
        
    
break;
case 4:

	        
break;
case 5:

        
    
break;
case 6:

	    
            $thisS = $s[$o] * 1;
        
    
break;
case 7:

        
	        $thisS = substr($s[$o], 1, -1);
        
    
break;
case 8:

        
            $thisS = substr($s[$o], 2, -2);
        
    
break;
case 9:

        var type = {
        	t: 'v',
        	v: $s[$o]
        };
        yy->types.push(type);
    
break;
case 10:

        
            $thisS = $s[$o-2] . '' . $s[$o];
        
    
break;
case 11:

	    
            $thisS = $s[$o-2] == $s[$o];
        
    
break;
case 12:

	    
			if (is_numeric($s[$o-2]) && is_numeric($s[$o])) {
			   $thisS = $s[$o-2] + $s[$o];
			} else {
			   $thisS = $s[$o-2] . $s[$o];
			}
        
    
break;
case 13:

	    	
break;
case 14:

        
            $thisS = ($s[$o-3] * 1) <= ($s[$o] * 1);
        
    
break;
case 15:

        
            $thisS = ($s[$o-3] * 1) >= ($s[$o] * 1);
        
    
break;
case 16:

		
        	$thisS = ($s[$o-3]) != ($s[$o]);
		
    
break;
case 17:

	    
		    $thisS = ($s[$o-2] * 1) > ($s[$o] * 1);
        
    
break;
case 18:

        
            $thisS = ($s[$o-2] * 1) < ($s[$o] * 1);
        
    
break;
case 19:

        
            $thisS = ($s[$o-2] * 1) - ($s[$o] * 1);
        
    
break;
case 20:

	    
            $thisS = ($s[$o-2] * 1) * ($s[$o] * 1);
        
    
break;
case 21:

	    
            $thisS = ($s[$o-2] * 1) / ($s[$o] * 1);
        
    
break;
case 22:

        
            $thisS = pow(($s[$o-2] * 1), ($s[$o] * 1));
        
    
break;
case 23:

		
            $thisS = $s[$o-1] * 1;
        
	
break;
case 24:

	    
            $thisS = $s[$o-1] * 1;
        
	
break;
case 25:
/*$thisS = Math.E;*/;
break;
case 26:

	    
		    $thisS = $this->callFunction($s[$o-2]);
        
    
break;
case 27:

	    
            $thisS = $this->callFunction($s[$o-3], $s[$o-1]);
        
    
break;
case 29:

	    
            $thisS = $this->cellValue($s[$o]);
        
    
break;
case 30:

	    
            $thisS = $this->cellRangeValue($s[$o-2], $s[$o]);
        
    
break;
case 31:

	    
            $thisS = $this->remoteCellValue($s[$o-2], $s[$o]);
        
    
break;
case 32:

	    
            $thisS = $this->remoteCellRangeValue($s[$o-4], $s[$o-2], $s[$o]);
        
    
break;
case 33:

		
            $thisS = array($s[$o]);
        
    
break;
case 53:

	    
            $s[$o-2][] = $s[$o];
            $thisS = $s[$o-2];
        
    
break;
case 54:

 	    
			$s[$o-2][] = $s[$o];
			$thisS = $s[$o-2];
        
    
break;
case 55:

        $thisS = [$s[$o]];
    
break;
case 56:

        
            $thisS = (is_array($s[$o-2]) ? $s[$o-2] : array());
            $thisS[] = $s[$o];
        
    
break;
case 57:

        $thisS = $s[$o];
    
break;
case 58:

        
            $thisS = $s[$o-2] . '.' . $s[$o];
        
    
break;
case 59:

		
        	$thisS = ($s[$o-1] * 0.01) . '';
        
    
break;
}

    }

    function parserLex()
    {
        $token = $this->lexerLex(); // $end = 1

        if (isset($token)) {
            return $token;
        }

        return $this->symbols["end"];
    }

    function parseError($str = "", ParserError $hash = null)
    {
        throw new Exception($str);
    }

    function lexerError($str = "", LexerError $hash = null)
    {
        throw new Exception($str);
    }

    function parse($input)
    {
        if (empty($this->table)) {
            throw new Exception("Empty Table");
        }
        $this->eof = new ParserSymbol("Eof", 1);
        $firstAction = new ParserAction(0, $this->table[0]);
        $firstCachedAction = new ParserCachedAction($firstAction);
        $stack = array($firstCachedAction);
        $stackCount = 1;
        $vstack = array(null);
        $vstackCount = 1;
        $yy = null;
        $_yy = null;
        $recovering = 0;
        $symbol = null;
        $action = null;
        $errStr = "";
        $preErrorSymbol = null;
        $state = null;

        $this->setInput($input);

        while (true) {
            // retrieve state number from top of stack
            $state = $stack[$stackCount - 1]->action->state;
            // use default actions if available
            if ($state != null && isset($this->defaultActions[$state->index])) {
                $action = $this->defaultActions[$state->index];
            } else {
                if (empty($symbol) == true) {
                    $symbol = $this->parserLex();
                }
                // read action for current state and first input
                if (isset($state) && isset($state->actions[$symbol->index])) {
                    //$action = $this->table[$state][$symbol];
                    $action = $state->actions[$symbol->index];
                } else {
                    $action = null;
                }
            }

            if ($action == null) {
                if ($recovering == 0) {
                    // Report error
                    $expected = array();
                    foreach($this->table[$state->index]->actions as $p => $item) {
                        if (!empty($this->terminals[$p]) && $p > 2) {
                            $expected[] = $this->terminals[$p]->name;
                        }
                    }

                    $errStr = "Parse error on line " . ($this->yy->lineNo + 1) . ":\n" . $this->showPosition() . "\nExpecting " . implode(", ", $expected) . ", got '" . (isset($this->terminals[$symbol->index]) ? $this->terminals[$symbol->index]->name : 'NOTHING') . "'";

                    $this->parseError($errStr, new ParserError($this->match, $state, $symbol, $this->yy->lineNo, $this->yy->loc, $expected));
                }
            }

            if ($state === null || $action === null) {
                break;
            }

            switch ($action->action) {
                case 1:
                    // shift
                    //$this->shiftCount++;
                    $stack[] = new ParserCachedAction($action, $symbol);
                    $stackCount++;

                    $vstack[] = clone($this->yy);
                    $vstackCount++;

                    $symbol = "";
                    if ($preErrorSymbol == null) { // normal execution/no error
                        $yy = clone($this->yy);
                        if ($recovering > 0) $recovering--;
                    } else { // error just occurred, resume old look ahead f/ before error
                        $symbol = $preErrorSymbol;
                        $preErrorSymbol = null;
                    }
                    break;

                case 2:
                    // reduce
                    $len = $this->productions[$action->state->index]->len;
                    // perform semantic action
                    $_yy = $vstack[$vstackCount - $len];// default to $S = $1
                    // default location, uses first token for firsts, last for lasts

                    if (isset($this->ranges)) {
                        //TODO: add ranges
                    }

                    $r = $this->parserPerformAction($_yy->text, $yy, $action->state->index, $vstack, $vstackCount - 1);

                    if (isset($r)) {
                        return $r;
                    }

                    // pop off stack
                    while ($len > 0) {
                        $len--;

                        array_pop($stack);
                        $stackCount--;

                        array_pop($vstack);
                        $vstackCount--;
                    }

                    if (is_null($_yy))
                    {
                        $vstack[] = new ParserValue();
                    }
                    else
                    {
                        $vstack[] = $_yy;
                    }
                    $vstackCount++;

                    $nextSymbol = $this->productions[$action->state->index]->symbol;
                    // goto new state = table[STATE][NONTERMINAL]
                    $nextState = $stack[$stackCount - 1]->action->state;
                    $nextAction = $nextState->actions[$nextSymbol->index];

                    $stack[] = new ParserCachedAction($nextAction, $nextSymbol);
                    $stackCount++;

                    break;

                case 3:
                    // accept
                    return true;
            }

        }

        return true;
    }


    /* Jison generated lexer */
    public $eof;
    public $yy = null;
    public $match = "";
    public $conditionStack = array();
    public $conditionStackCount = 0;
    public $rules = array();
    public $conditions = array();
    public $done = false;
    public $less;
    public $more;
    public $input;
    public $offset;
    public $ranges;
    public $flex = false;

    function setInput($input)
    {
        $this->input = new InputReader($input);
        $this->more = $this->less = $this->done = false;
        $this->yy = new ParserValue();
        $this->conditionStack = array('INITIAL');
        $this->conditionStackCount = 1;

        if (isset($this->ranges)) {
            $loc = $this->yy->loc = new ParserLocation();
            $loc->Range(new ParserRange(0, 0));
        } else {
            $this->yy->loc = new ParserLocation();
        }
        $this->offset = 0;
    }

    function input()
    {
        $ch = $this->input->ch();
        $this->yy->text .= $ch;
        $this->yy->leng++;
        $this->offset++;
        $this->match .= $ch;
        $lines = preg_match("/(?:\r\n?|\n).*/", $ch);
        if (count($lines) > 0) {
            $this->yy->lineNo++;
            $this->yy->loc->lastLine++;
        } else {
            $this->yy->loc->lastColumn++;
        }
        if (isset($this->ranges)) {
            $this->yy->loc->range->y++;
        }

        return $ch;
    }

    function unput($ch)
    {
        $yy = new ParserValue();

        $len = strlen($ch);
        $lines = explode("/(?:\r\n?|\n)/", $ch);
        $linesCount = count($lines);

        $this->input->unCh($len);
        $yy->text = substr($this->yy->text, 0, $len - 1);
        //$this->yylen -= $len;
        $this->offset -= $len;
        $oldLines = explode("/(?:\r\n?|\n)/", $this->match);
        $oldLinesCount = count($oldLines);
        $this->match = substr($this->match, 0, strlen($this->match) - 1);

        if (($linesCount - 1) > 0) {
            $yy->lineNo = $this->yy->lineNo - $linesCount - 1;
        }
        $r = $this->yy->loc->range;
        $oldLinesLength = (isset($oldLines[$oldLinesCount - $linesCount]) ? strlen($oldLines[$oldLinesCount - $linesCount]) : 0);

        $yy->loc = new ParserLocation(
            $this->yy->loc->firstLine,
            $this->yy->lineNo,
            $this->yy->loc->firstColumn,
            $this->yy->loc->firstLine,
            (empty($lines) ?
                ($linesCount == $oldLinesCount ? $this->yy->loc->firstColumn : 0) + $oldLinesLength :
                $this->yy->loc->firstColumn - $len)
        );

        if (isset($this->ranges)) {
            $yy->loc->range(new ParserRange($r->x, $r->x + $this->yy->leng - $len));
        }

        $this->unputStack[] = $yy;
    }

    function more()
    {
        $this->more = true;
    }

    function pastInput()
    {
        $matched = $this->input->toString();
        $past = substr($matched, 0, strlen($matched) - strlen($this->match));
        return (strlen($past) > 20 ? '...' : '') . preg_replace("/\n/", "", substr($past, -20));
    }

    function upcomingInput()
    {
        if (!$this->done) {
            $next = $this->match;
            if (strlen($next) < 20) {
                $next .= substr($this->input->toString(), 0, 20 - strlen($next));
            }
            return preg_replace("/\n/", "", substr($next, 0, 20) . (strlen($next) > 20 ? '...' : ''));
        } else {
            return "";
        }
    }

    function showPosition()
    {
        $pre = $this->pastInput();

        $c = '';
        for($i = 0, $preLength = strlen($pre); $i < $preLength; $i++) {
            $c .= '-';
        }

        return $pre . $this->upcomingInput() . "\n" . $c . "^";
    }

    function next()
    {
        if ($yy = array_pop($this->unputStack)) {
            $this->yy = $yy;
        }
        if ($this->done == true) {
            return $this->eof;
        }

        if ($this->input->done) {
            $this->done = true;
        }

        if ($this->more == false) {
            $this->yy->text = '';
            $this->match = '';
        }

        $rules = $this->currentRules();
        for ($i = 0, $j = count($rules); $i < $j; $i++) {
            $tempMatch = $this->input->match($this->rules[$rules[$i]]);
            if ($tempMatch && (empty($match) || count($tempMatch[0]) > count($match[0]))) {
                $match = $tempMatch;
                $index = $i;
                if (isset($this->flex) && $this->flex == false) {
                    break;
                }
            }
        }
        if ( $match ) {
            $matchCount = strlen($match[0]);
            $lineCount = preg_match("/(?:\r\n?|\n).*/", $match[0], $lines);
            $line = ($lines ? $lines[$lineCount - 1] : false);
            $this->yy->lineNo += $lineCount;

            $this->yy->loc = new ParserLocation(
                $this->yy->loc->lastLine,
                $this->yy->lineNo + 1,
                $this->yy->loc->lastColumn,
                ($line ?
                    count($line) - preg_match("/\r?\n?/", $line, $na) :
                    $this->yy->loc->lastColumn + $matchCount
                )
            );


            $this->yy->text .= $match[0];
            $this->match .= $match[0];
            $this->matches = $match;

            $this->yy->leng = strlen($this->yy->text);
            if (isset($this->ranges)) {
                $this->yy->loc->range = new ParserRange($this->offset, $this->offset += $this->yy->leng);
            }
            $this->more = false;
            $this->input->addMatch($match[0]);
            $ruleIndex = $rules[$index];
            $nextCondition = $this->conditionStack[$this->conditionStackCount - 1];

            $token = $this->lexerPerformAction($ruleIndex, $nextCondition);

            if ($this->done == true && !$this->input->done) {
                $this->done = false;
            }

            if (empty($token) == false) {
                return $this->symbols[
                    $token
                ];
            } else {
                return null;
            }
        }

        if ($this->input->done) {
            return $this->eof;
        } else {
            $this->lexerError("Lexical error on line " . ($this->yy->lineNo + 1) . ". Unrecognized text.\n" . $this->showPosition(), new LexerError("", -1, $this->yy->lineNo));
            return null;
        }
    }

    function lexerLex()
    {
        $r = $this->next();

        while (is_null($r) && !$this->done) {
            $r = $this->next();
        }

        return $r;
    }

    function begin($condition)
    {
        $this->conditionStackCount++;
        $this->conditionStack[] = $condition;
    }

    function popState()
    {
        $this->conditionStackCount--;
        return array_pop($this->conditionStack);
    }

    function currentRules()
    {
        $peek = $this->conditionStack[$this->conditionStackCount - 1];
        return $this->conditions[$peek]->rules;
    }

    function LexerPerformAction($avoidingNameCollisions, $YY_START = null)
    {
        
;
switch($avoidingNameCollisions) {
case 0:/* skip whitespace */
break;
case 1:return 25;
break;
case 2:return 7;
break;
case 3:return 8;
break;
case 4:
	return 30;

break;
case 5:
    
        $this->yy->text = substr($this->yy->text, 1, -1);
        return 30;
    

break;
case 6:return 10;
break;
case 7:return 10;
break;
case 8:return 11;
break;
case 9:return 11;
break;
case 10:return 12;
break;
case 11:return 37;
break;
case 12:return 37;
break;
case 13:return 32;
break;
case 14:return 33;
break;
case 15:return 13;
break;
case 16:return ' ';
break;
case 17:return 38;
break;
case 18:return 29;
break;
case 19:return 35;
break;
case 20:return 36;
break;
case 21:return 21;
break;
case 22:return 22;
break;
case 23:return 20;
break;
case 24:return 15;
break;
case 25:return 23;
break;
case 26:return 16;
break;
case 27:return 17;
break;
case 28:return 19;
break;
case 29:return 18;
break;
case 30:return 'PI';
break;
case 31:return 24;
break;
case 32:return '"';
break;
case 33:return "'";
break;
case 34:return '\"';
break;
case 35:return "\'";
break;
case 36:return "!";
break;
case 37:return 14;
break;
case 38:return 39;
break;
case 39:return 34;
break;
case 40:return '#';
break;
case 41:return 4;
break;
}

    }
}

class ParserLocation
{
    public $firstLine = 1;
    public $lastLine = 0;
    public $firstColumn = 1;
    public $lastColumn = 0;
    public $range;

    public function __construct($firstLine = 1, $lastLine = 0, $firstColumn = 1, $lastColumn = 0)
    {
        $this->firstLine = $firstLine;
        $this->lastLine = $lastLine;
        $this->firstColumn = $firstColumn;
        $this->lastColumn = $lastColumn;
    }

    public function Range($range)
    {
        $this->range = $range;
    }

    public function __clone()
    {
        if (isset($this->range)) {
            $this->range = clone $this->range;
        }
    }
}

class ParserValue
{
    public $leng = 0;
    public $loc;
    public $lineNo = 0;
    public $text;

    function __clone() {
        if (isset($this->loc)) {
            $this->loc = clone $this->loc;
        }
    }
}

class LexerConditions
{
    public $rules;
    public $inclusive;

    function __construct($rules, $inclusive)
    {
        $this->rules = $rules;
        $this->inclusive = $inclusive;
    }
}

class ParserProduction
{
    public $len = 0;
    public $symbol;

    public function __construct($symbol, $len = 0)
    {
        $this->symbol = $symbol;
        $this->len = $len;
    }
}

class ParserCachedAction
{
    public $action;
    public $symbol;

    function __construct($action, $symbol = null)
    {
        $this->action = $action;
        $this->symbol = $symbol;
    }
}

class ParserAction
{
    public $action;
    public $state;
    public $symbol;

    function __construct($action, &$state = null, &$symbol = null)
    {
        $this->action = $action;
        $this->state = $state;
        $this->symbol = $symbol;
    }
}

class ParserSymbol
{
    public $name;
    public $index = -1;
    public $symbols = array();
    public $symbolsByName = array();

    function __construct($name, $index)
    {
        $this->name = $name;
        $this->index = $index;
    }

    public function addAction($a)
    {
        $this->symbols[$a->index] = $this->symbolsByName[$a->name] = $a;
    }
}

class ParserError
{
    public $text;
    public $state;
    public $symbol;
    public $lineNo;
    public $loc;
    public $expected;

    function __construct($text, $state, $symbol, $lineNo, $loc, $expected)
    {
        $this->text = $text;
        $this->state = $state;
        $this->symbol = $symbol;
        $this->lineNo = $lineNo;
        $this->loc = $loc;
        $this->expected = $expected;
    }
}

class LexerError
{
    public $text;
    public $token;
    public $lineNo;

    public function __construct($text, $token, $lineNo)
    {
        $this->text = $text;
        $this->token = $token;
        $this->lineNo = $lineNo;
    }
}

class ParserState
{
    public $index;
    public $actions = array();

    function __construct($index)
    {
        $this->index = $index;
    }

    public function setActions(&$actions)
    {
        $this->actions = $actions;
    }
}

class ParserRange
{
    public $x;
    public $y;

    function __construct($x, $y)
    {
        $this->x = $x;
        $this->y = $y;
    }
}

class InputReader
{
    public $done = false;
    public $input;
    public $length;
    public $matches = array();
    public $position = 0;

    public function __construct($input)
    {
        $this->input = $input;
        $this->length = strlen($input);
    }

    public function addMatch($match) {
        $this->matches[] = $match;
        $this->position += strlen($match);
        $this->done = ($this->position >= $this->length);
    }

    public function ch()
    {
        $ch = $this->input{$this->position};
        $this->addMatch($ch);
        return $ch;
    }

    public function unCh($chLength)
    {
        $this->position -= $chLength;
        $this->position = max(0, $this->position);
        $this->done = ($this->position >= $this->length);
    }

    public function substring($start, $end) {
        $start = ($start != 0 ? $this->position + $start : $this->position);
        $end = ($end != 0 ? $start + $end : $this->length);
        return substr($this->input, $start, $end);
    }

    public function match($rule) {
        if (preg_match($rule, $this->input, $match, null, $this->position)) {
            return $match;
        }
        return null;
    }

    public function toString()
    {
        return implode('', $this->matches);
    }
}