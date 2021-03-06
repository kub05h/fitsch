<?php
    header("Content-Type: text/html; charset=UTF-8");
?>

<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">    
    <title>FIT scheduler</title>

    <link rel="stylesheet" href="./style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="./script.js"></script>    
</head>
<body>
    <div class="res_mes">Šířka okna menší než 700px není podporována.</div>
    <div class="header">
        <div class="header_logo"></div>
        <div class="header_text">scheduler <span class="header_text_version">v. 2.2</span></div>
        <div class="header_menu_icon"></div>
        <div class="header_message"></div>
        <div class="clear"></div>
    </div>
    <div class="menu hidden">
        <div class="menu_columns">
            <div class="menu_column">
                <div class="menu_column_title">Ročník</div>
                <div class="menu_column_conta">
                    <div class="menu_column_row">
                        <input class="menu_column_row_checkbox grade_checkbox" type="checkbox" name="grade" value="0">
                        <div class="menu_column_row_text">1BIT</div>
                        <div class="clear"></div>
                    </div>
                    <div class="menu_column_row">
                        <input class="menu_column_row_checkbox grade_checkbox" type="checkbox" name="grade" value="1">
                        <div class="menu_column_row_text">2BIT</div>
                        <div class="clear"></div>
                    </div>
                    <div class="menu_column_row">
                        <input class="menu_column_row_checkbox grade_checkbox" type="checkbox" name="grade" value="2">
                        <div class="menu_column_row_text">3BIT</div>
                        <div class="clear"></div>
                    </div>
                </div>
            </div>
            <div class="menu_column">
                <div class="menu_column_title">Semestr</div>
                <div class="menu_column_conta">
                    <div class="menu_column_row">
                        <input class="menu_column_row_radio sem_radio" type="radio" name="sem" value="0">
                        <div class="menu_column_row_text">Zimní</div>
                        <div class="clear"></div>
                    </div>
                    <div class="menu_column_row">
                        <input class="menu_column_row_radio sem_radio" type="radio" name="sem" value="1">
                        <div class="menu_column_row_text">Letní</div>
                        <div class="clear"></div>
                    </div>
                </div>
            </div>
            <div class="menu_column_cleaner"></div>
            <div class="menu_column">
                <div class="menu_column_title">Povinné předměty</div>
                <div class="menu_column_conta menu_com_sub"></div>
            </div>
            <div class="menu_column">
                <div class="menu_column_title">Volitelné předměty</div>
                <div class="menu_column_conta menu_opt_sub"></div>
            </div>
            <div class="clear"></div>
        </div>
        <div class="menu_buttons">
            <input class="sch_load hidden" type="file" name="sch_load">
            <input class="menu_button menu_button_l menu_load_button" type="button" value="Otevřít">
            <input class="menu_button menu_button_l menu_save_button" type="button" value="Uložit">
            <input class="menu_button menu_button_r menu_submit_button" type="button" value="Zobrazit">
            <div class="clean"></div>
        </div>
    </div>

    <div class="sec_half">
        <div class="title">Info k aplikaci</div>
        <div class="bubble bubble_red">Přečti si to pls.</div>
        <div class="bubble">V pravo nahoře je menu, kde se vybírají předměty. Data se načítají ze stránek FITu. Pokud nemá předmět vypsaný cvičení, ale jenom rezervaci učebny od rána do večera, tak se tento blok rozláme na dvouhodinovky. To někdy nemusí souhlasit s termínama, které jsou ve wisu. Cvičení vytvořené tímto způsobem mají míň sytou barvu.</div>
        <div class="bubble">Zeleně jsou přednášky, modře dema a okrově cvičení. Černá barva rámečku znamená, že je hodina v každým týdnu, červená barva v sudých týdnech a modrá pro lichý týdny. Přednáškové skupiny se zobrazují pokud je hodina vypsaná pouze pro jednu skupinu. Barva se opět načítá ze stránek FITu a tak někdy můžou být modře i cvičení protože to tak je vypsaný.</div>
        <div class="bubble">Kliknutím na hvězdičku se přednáška/cvičení vybere a zobrazí se ve výsledným rovrhu dole. V pracovním rozvrhu se změní rámeček z čárkovanýho na plnej. Dalším kliknutím na hvězdičku se hodina odebere z výsledného rozvhu a rámeček se zpět změní na čárkovanej.</div>
        <div class="bubble">Kliknutím na popelnicu hodina zašedne. To je pro případy kdy víte, že tuto hodinu můžete určitě vyřadit. Opětovným kliknutím se vrátí. Vlastní cvičení popelnice úplně odstraní.</div>
        <div class="bubble">Nad pracovním rozvrhem je pole pro přidání vlastního cvičení z wisu. Pro případ že wis nesouhlasí s vypsanýma cvičeníma jak jsem psal výše.</div>
        <div class="bubble">V menu jsou tlačítka "Otevřít" a "Uložit" díky kterým, si lze rozvrh uložit a potom ho otevřít později, nebo někoumu poslat atd.</div>
        <div class="bubble bubble_red">Neručim za nic. Znova opakuju data se načítají z karet předmětů, takže konzistenze s wisem a realitou není zaručená. Plus jsem to programoval já :Hahaa:.</div>        
    </div>
    <div class="sec_half">
        <div class="title">Rozvrhy na FITu</div>
        <div class="bubble bubble_red">Pro prváky.</div>
        <div class="bubble">Jak už jste si asi všimli, tak na vejšce fungujou rozvrhy trochu jinak než na střední. Není žádnej jednotnej rozvrh pro každej ročník. Ale každý student si rozvrh sestavuje sám podle předmětů, které má zapsané a jak má čas.</div>
        <div class="bubble">Výuka se skládá v základu z přednášek, democvičení a cvičení. Přednášky se konají v přednáškovnách, to jsou ty velké místnosti. Většinou v jedné velké hlavní (D105, E112), kam se ale šici nevejdou, proto jsou tu pro každou hlavní další dvě menší, kde se přednáška streamuje (D0207 a D0206, E104 a E105). Proto je např. v rozvhru napsáno, že je přednáška v D105, D0206 a D0207. Jedna nebo obě z těch měnších se nemusí vždy oteřít, otevírá se podle počtu lidí co příjde. Přednáška trvá 2 nebo 3 hodiny.</div>
        <div class="bubble">Jelikož se celý ročník nevejde na jednu přednášku (ani s přídavnejma menšíma přednáškovnama), tak je ročník rozdělen na 2 skupiny (1BIA a 1BIB) a každá má svou přednášku v týdnu. V rozvhu je pak vidět že přednášky od jednoho předmětu jsou pro 1BIA nebo 1BIB. A na vás je jakou si vyberete a jak to nakombinujete s ostatníma přednáškama, cvičeníma, pauzou na oběd a aby nevznikly kolize. Obě skupiny musí za semestr probrat stejnou látku to ale neznamená, že např. v 5. týdnu semestru bude probíraná látka stejná u obou skupin. Je to dáno tím že každý přednášející má jiné tempo. Změna skupiny v půlce semestru je tedy na opováženou.</div>
        <div class="bubble">Každý předmět má svůj rozsah přednášek. Semestr má 13 týdnů takže pokud má předmět rozsah přednášek 39 hodin, tak 39 / 13 = 3 hodiny přednášky za týden. Buď jsou přednášky tříhodinové bloky nebo 2 hodiny někdy a hodina jindy. Přednášky patří k sobě podle skupiny.</div>
        <div class="bubble">Democvičení je vylepšená přednáška kde přednášející ukazuje IRL vyučovanou látku např. počítá příklady (k tabuli se tady nechodí).</div>
        <div class="bubble">Cvičení se odehrávají v učebnách po cca 20 - 50 lidech. Na PC nebo v laboratořích atd. podle předmětu. Kolik jich má být za týden lze zjistit opět z rozsahu tak že se sečte "všechno ostatní" (většinou aby to bylo prostě dělitelný 13, je to tak různě nafixlovaný aby to sedělo papírově) a vydělí 13. Termíny cvičení jsou vypsané na stránkách předmětu ale je nutné si ho pak ve wisu zaregistrovat. Když vám to nevyjde musíte si rozvrh překopat. Cvičení většinou bývaj 2 hodiny týdně. Někdy to co je na stránkách předmětu vůbec nesouhlasí s wisem ale wis má vždycky pravdu.</div>
        <div class="bubble bubble_red">Welcome to FIT, it takes a lot</div>
    </div>
    <div class="clear"></div>
    <div class="sec">
        <div class="bubble bubble_clear">By @Kubosh</div>
    </div>

    <div class="sec">
        <div class="title">Pracovní rozvrh</div>
        <div class="sch_add">
            <div class="sch_add_cell">
                <div class="sch_add_cell_text">Den:</div>
                <select class="sch_add_day sch_add_cell_select" name="day">
                    <option value="1">Po</option>
                    <option value="2">Út</option>
                    <option value="3">St</option>
                    <option value="4">Čt</option>
                    <option value="5">Pá</option>
                </select>
                <div class="clear"></div>
            </div>
            <div class="sch_add_cell">
                <div class="sch_add_cell_text">Týdny:</div>
                <select class="sch_add_weeks sch_add_cell_select" name="weeks">
                    <option value="výuky" selected>Oba</option>
                    <option value="sudý">Sudý</option>
                    <option value="lichý">Lichý</option>
                </select>
                <div class="clear"></div>
            </div>
            <div class="sch_add_cell">
                <div class="sch_add_cell_text">Název:</div>
                <input class="sch_add_name sch_add_cell_inpu_text" type="text" name="name">
                <div class="clear"></div>
            </div>
            <div class="sch_add_cell">
                <div class="sch_add_cell_text">Místnost:</div>
                <input class="sch_add_room sch_add_cell_inpu_text" type="text" name="room">
                <div class="clear"></div>
            </div>
            <div class="sch_add_cell">
                <div class="sch_add_cell_text">Od:</div>
                <select class="sch_add_from sch_add_cell_select" name="from">
                    <option value="0" selected>07:00</option>
                    <option value="1">08:00</option>
                    <option value="2">09:00</option>
                    <option value="3">10:00</option>
                    <option value="4">11:00</option>
                    <option value="5">12:00</option>
                    <option value="6">13:00</option>
                    <option value="7">14:00</option>
                    <option value="8">15:00</option>
                    <option value="9">16:00</option>
                    <option value="10">17:00</option>
                    <option value="11">18:00</option>
                    <option value="12">19:00</option>
                    <option value="13">20:00</option>
                </select>
                <div class="clear"></div>
            </div>
            <div class="sch_add_cell">
                <div class="sch_add_cell_text">Do:</div>
                <select class="sch_add_to sch_add_cell_select" name="to">
                    <option value="1" selected>07:50</option>
                    <option value="2">08:50</option>
                    <option value="3">09:50</option>
                    <option value="4">10:50</option>
                    <option value="5">11:50</option>
                    <option value="6">12:50</option>
                    <option value="7">13:50</option>
                    <option value="8">14:50</option>
                    <option value="9">15:50</option>
                    <option value="10">16:50</option>
                    <option value="11">17:50</option>
                    <option value="12">18:50</option>
                    <option value="13">19:50</option>
                    <option value="14">20:50</option>
                </select>
                <div class="clear"></div>
            </div>
            <input class="sch_add_button" type="submit" value="Přidat">
            <div class="clear"></div>
        </div>
        <div class="schedule schedule_all">
            <div class="schedule_header">
                <div class="schedule_header_cell_week"></div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">07:00<br/>07:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">08:00<br/>08:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">09:00<br/>09:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">10:00<br/>10:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">11:00<br/>11:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">12:00<br/>12:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">13:00<br/>13:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">14:00<br/>14:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">15:00<br/>15:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">16:00<br/>16:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">17:00<br/>17:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">18:00<br/>18:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">19:00<br/>19:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">20:00<br/>20:50</div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">Po</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">Út</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">St</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">Čt</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">Pá</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
        </div>
    </div>

    <div class="sec">
        <div class="title">Výsledný rozvrh</div>
        <div class="schedule schedule_fin">
            <div class="schedule_header">
                <div class="schedule_header_cell_week"></div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">07:00<br/>07:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">08:00<br/>08:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">09:00<br/>09:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">10:00<br/>10:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">11:00<br/>11:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">12:00<br/>12:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">13:00<br/>13:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">14:00<br/>14:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">15:00<br/>15:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">16:00<br/>16:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">17:00<br/>17:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">18:00<br/>18:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">19:00<br/>19:50</div>
                <div class="schedule_header_cell_divider"></div>
                <div class="schedule_header_cell">20:00<br/>20:50</div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">Po</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">Út</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">St</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">Čt</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
            <div class="schedule_row">
                <div class="schedule_row_header">Pá</div>
                <div class="schedule_row_layers"></div>
                <div class="clear"></div>
            </div>
        </div>
    </div>

    <div class="sec">
        <div class="title">Rozsahy</div>
        <div class="ranges"></div>
    </div>

    <div class="parsing hidden">
        <div class="subjects"></div>
        <div class="subject"></div>
    </iframe>    
</body>
</html>
