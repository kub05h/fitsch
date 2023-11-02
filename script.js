/////////////////////////////////// Variables //////////////////////////////////
var studies = [];                                                                                          // Array of loaded studies
var subjects = [];                                                                                         // Array of selected subjects
var lastLoadedSubjects = [];                                                                               // Array of last loaded subjects
var ranges = [];                                                                                           // Array of ranges of selected subjects
var lessons = [];                                                                                          // Array of lessons of selected subjects
var file = { "sem": "", "studies": [], "grades": [],
             "subjects": [], "custom": [], "selected": [], "deleted": [] };                                // File cache
var year = (new Date()).getMonth() + 1 >= 8 ? (new Date()).getFullYear() : (new Date()).getFullYear() - 1; // Academic year (from august display next ac. year)
var fakeHtml = document.implementation.createHTMLDocument('virtual');                                      // https://stackoverflow.com/a/50194774/7361496
var loadUrl = "./load.php";
// source: https://www.fit.vut.cz/study/calendar/.cs
// TODO: get this data automatically
var winterStart = {2022: "2022-09-19", 2023: "2023-09-18"};
var summerStart = {2023: "2023-02-06", 2024: "2024-02-05"};
///////////////////////////////////// Main /////////////////////////////////////
$(document).ready(async function() {
    // Semester radio auto select
    var d = new Date();
    if(d.getMonth() === 11 || d.getMonth() < 4) {
        $(".menu_sem_radio[value='summer']").prop("checked", true);
    } else {
        $(".menu_sem_radio[value='winter']").prop("checked", true);
    }

    // Start menu load
    await loadStudies();

    // Load local storage
    loadLocalStorage();
}); // checked

/////////////////////////////////// Automatic schedule generator //////////////////////////////////
let pyodide = null;
$.ajax({
    url: "rozvrh_gen.py",
    method: "GET",
    async: true,
    success: async function(e) {
        sourceCode = e;
        pyodide = await loadPyodide();
        await pyodide.loadPackage(
            "https://files.pythonhosted.org/packages/c7/c7/cd77b2992c565ff70e9cd9b2d29f4b83cc754aab9936f9d1937a980b459c/python_constraint-1.3.1-py2.py3-none-any.whl"
        );
        console.log(pyodide.runPython(e));
    }
}); // checked

let generate_schedule_id=0;

$(document).on("click", ".menu_generate_next", function() {
    let filteredLessons = lessons.filter(lesson => !lesson.deleted);
    let inverseFilteredLessons = lessons.filter(lesson => lesson.deleted);
    let generator = pyodide.globals.get('ScheduleGenerator')(filteredLessons);
    $(".menu_generate_rules").children().each(function(i, rule) {
        let max_value = Number($(rule).find(".rule_max_value").val());
        let monday = $(rule).find(".rule_monday").prop("checked");
        let tuesday = $(rule).find(".rule_tuesday").prop("checked");
        let wednesday = $(rule).find(".rule_wednesday").prop("checked");
        let thursday = $(rule).find(".rule_thursday").prop("checked");
        let friday = $(rule).find(".rule_friday").prop("checked");
        let begginning = Number($(rule).find(".rule_begginning").val());
        let ending = Number($(rule).find(".rule_ending").val());
        let weighted = true;
        let days = [];
        if(monday) days.push(0);
        if(tuesday) days.push(1);
        if(wednesday) days.push(2);
        if(thursday) days.push(3);
        if(friday) days.push(4);
        console.log(max_value, days, begginning, ending, weighted);
        generator.add_constraint(max_value, days, begginning, ending, weighted);
    });
    generator.every_class_type_only_once();
    generator.every_hour_only_once();
    let schedules_count = generator.get_schedules_count();
    if(schedules_count == 0) {
        alert("Nelze vygenerovat rozvrh pro dané pravidla!");
        return;
    }
    generate_schedule_id += 1;
    if(generate_schedule_id<0) generate_schedule_id = 0;
    if(generate_schedule_id>=schedules_count) generate_schedule_id = schedules_count-1;
    $.each(inverseFilteredLessons, function(i, lesson) {
        lesson.selected = false;
    });
    $.each(generator.generate_schedule(generate_schedule_id), function(i, selected) {
        filteredLessons[i].selected = selected;
    });
    $(".generated_rozvrh_options").text("Rozvrh: " + (generate_schedule_id+1) + "/" + schedules_count);
    renderAll();
});

$(document).on("click", ".menu_generate_prev", function() {
    let filteredLessons = lessons.filter(lesson => !lesson.deleted);
    let inverseFilteredLessons = lessons.filter(lesson => lesson.deleted);
    let generator = pyodide.globals.get('ScheduleGenerator')(filteredLessons);
    $(".menu_generate_rules").children().each(function(i, rule) {
        let max_value = Number($(rule).find(".rule_max_value").val());
        let monday = $(rule).find(".rule_monday").prop("checked");
        console.log(i, rule);
        let tuesday = $(rule).find(".rule_tuesday").prop("checked");
        let wednesday = $(rule).find(".rule_wednesday").prop("checked");
        let thursday = $(rule).find(".rule_thursday").prop("checked");
        let friday = $(rule).find(".rule_friday").prop("checked");
        let begginning = Number($(rule).find(".rule_begginning").val());
        let ending = Number($(rule).find(".rule_ending").val());
        let weighted = true;
        let days = [];
        if(monday) days.push(0);
        if(tuesday) days.push(1);
        if(wednesday) days.push(2);
        if(thursday) days.push(3);
        if(friday) days.push(4);
        console.log(max_value, days, begginning, ending, weighted);
        generator.add_constraint(max_value, days, begginning, ending, weighted);
    });
    generator.every_class_type_only_once();
    generator.every_hour_only_once();
    let schedules_count = generator.get_schedules_count();
    if(schedules_count == 0) {
        alert("No schedules found!");
        return;
    }
    generate_schedule_id -= 1;
    if(generate_schedule_id<0) generate_schedule_id = 0;
    if(generate_schedule_id>=schedules_count) generate_schedule_id = schedules_count-1;
    $.each(inverseFilteredLessons, function(i, lesson) {
        lesson.selected = false;
    });
    $.each(generator.generate_schedule(generate_schedule_id), function(i, selected) {
        filteredLessons[i].selected = selected;
    });
    $(".generated_rozvrh_options").text("Rozvrh: " + (generate_schedule_id+1) + "/" + schedules_count);
    renderAll();
});

$(document).on("click", ".delete_rule", function() {
    $(this).parent().parent().remove();
});

$(document).on("click", ".menu_generate_add_rule", function() {
    $(".menu_generate_rules").append(
        `<div class="menu_generate_rule">
            <div class="menu_column_row">
                <div class="menu_column_row_text">Maximální počet hodin:</div>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row" style="height: 40px">
                <select class="menu_column_row_select rule_max_value">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">13</option>
                </select>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row">
                <input class="menu_column_row_checkbox rule_monday" type="checkbox" checked="checked">
                <div class="menu_column_row_text">Pondělí</div>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row">
                <input class="menu_column_row_checkbox rule_tuesday" type="checkbox" checked="checked">
                <div class="menu_column_row_text">Úterý</div>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row">
                <input class="menu_column_row_checkbox rule_wednesday" type="checkbox" checked="checked">
                <div class="menu_column_row_text">Středa</div>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row">
                <input class="menu_column_row_checkbox rule_thursday" type="checkbox" checked="checked">
                <div class="menu_column_row_text">Čtvrtek</div>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row">
                <input class="menu_column_row_checkbox rule_friday" type="checkbox" checked="checked">
                <div class="menu_column_row_text">Pátek</div>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row">
                <div class="menu_column_row_text">Začátek:</div>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row" style="height: 40px">
                <select class="menu_column_row_select rule_begginning">
                    <option value="0">7:00</option>
                    <option value="1">8:00</option>
                    <option value="2">9:00</option>
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
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row">
                <div class="menu_column_row_text">Konec:</div>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row" style="height: 40px">
                <select class="menu_column_row_select rule_ending">
                    <option value="0">7:50</option>
                    <option value="1">8:50</option>
                    <option value="2">9:50</option>
                    <option value="3">10:50</option>
                    <option value="4">11:50</option>
                    <option value="5">12:50</option>
                    <option value="6">13:50</option>
                    <option value="7">14:50</option>
                    <option value="8">15:50</option>
                    <option value="9">16:50</option>
                    <option value="10">17:50</option>
                    <option value="11">18:50</option>
                    <option value="12">19:50</option>
                    <option value="13">20:50</option>
                </select>
                <div class="cleaner"></div>
            </div>
            <div class="menu_column_row" style="padding-top:10px">
                <button class="menu_button delete_rule">Odstranit pravidlo</button>
                <div class="cleaner"></div>
            </div>
        </div>`);
}); // checked

//////////////////////////////////// Events ////////////////////////////////////
// Icons
$(document).on("click", ".header_info_icon", function() {
    $(".header_info_icon").addClass("hidden");
    $(".header_cross_icon").removeClass("hidden");

    $(".secs_main").addClass("hidden");
    $(".secs_info").removeClass("hidden");
    $(".secs_generator_info").addClass("hidden");
}); // checked
$(document).on("click", ".generator_info_icon", function() {
    $(".header_cross_icon").removeClass("hidden");

    $(".secs_main").addClass("hidden");
    $(".secs_info").addClass("hidden");
    $(".secs_generator_info").removeClass("hidden");
}); // checked
$(document).on("click", ".header_cross_icon", function() {
    $(".header_info_icon").removeClass("hidden");
    $(".header_cross_icon").addClass("hidden");

    $(".secs_main").removeClass("hidden");
    $(".secs_info").addClass("hidden");
    $(".secs_generator_info").addClass("hidden");
}); // checked
$(document).on("click", ".menu_icon", function() {
    $(".menu_icon").addClass("hidden");

    $(".secs").removeClass("secs_menu_hidden");
    $(".menu").removeClass("hidden");
}); // checked
$(document).on("click", ".menu_cross_icon", function() {
    $(".menu_icon").removeClass("hidden");

    $(".secs").addClass("secs_menu_hidden");
    $(".menu").addClass("hidden");
}); // checked

// Menu
$(document).on("change", ".year_select", async function(e) {
    year = Number($(this).val());
    studies = subjects = lastLoadedSubjects = ranges = lessons = [];
    file = { "sem": "", "studies": [], "grades": [],
             "subjects": [], "custom": [], "selected": [], "deleted": [] };
    await loadStudies();
    loadLessons();
}); // checked
$(document).on("click", ".menu_sem_radio", function() {
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); // checked
$(document).on("click", ".menu_bit_checkbox", function() {
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); // checked
$(document).on("click", ".menu_mit_radio", function() {
    // Can uncheck
    if($(this).hasClass("mit_radio_checked")) {
        $(".menu_mit_radio").removeClass("mit_radio_checked");
        $(this).prop("checked", false);
    } else {
        $(".menu_mit_radio").removeClass("mit_radio_checked");
        $(this).addClass("mit_radio_checked");
    }

    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); // checked
$(document).on("click", ".menu_grade_checkbox", function() {
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); // checked
$(document).on("click", ".menu_sub_checkbox", function() {
    renderSubjects();
}); // checked
$(document).on("click", ".menu_sel_checkbox", function() {
    renderSubjects();
}); // checked
$(document).on("keyup", ".menu_com_search_input", function() {
    $(".menu_com_column .menu_column_row").removeClass("hidden_search");
    if($(".menu_com_search_input").prop("value") != "") {
        $(".menu_com_column .menu_column_row").addClass("hidden_search");
        $(".menu_com_column .menu_column_row").each(function(i, sub) {
            if($(sub).children(".menu_column_row_text").length > 0) {
                if($(sub).children(".menu_column_row_text").html().toUpperCase().includes($(".menu_com_search_input").prop("value").toUpperCase())) {
                    $(sub).removeClass("hidden_search");
                }
            }
        });
    }
}); // checked
$(document).on("keyup", ".menu_opt_search_input", function() {
    $(".menu_opt_column .menu_column_row").removeClass("hidden_search");
    if($(".menu_opt_search_input").prop("value") != "") {
        $(".menu_opt_column .menu_column_row").addClass("hidden_search");
        $(".menu_opt_column .menu_column_row").each(function(i, sub) {
            if($(sub).children(".menu_column_row_text").length > 0) {
                if($(sub).children(".menu_column_row_text").html().toUpperCase().includes($(".menu_opt_search_input").prop("value").toUpperCase())) {
                    $(sub).removeClass("hidden_search");
                }
            }
        });
    }
}); // checked
$(document).on("click", ".secs_header_elem", function() {
    $(".secs_header_elem").removeClass("secs_header_elem_selected");
    $(".sec").addClass("sec_invisible");

    $(this).addClass("secs_header_elem_selected");
    if($(this).hasClass("ch_0")) {
        $(".se_0").removeClass("sec_invisible");
    } else if($(this).hasClass("ch_1")) {
        $(".se_1").removeClass("sec_invisible");
    } else if($(this).hasClass("ch_2")) {
        $(".se_2").removeClass("sec_invisible");
    }
}); // checked

// Controls
$(document).on("click", ".menu_submit_button", function() {
    loadLessons();
    storeLocalStorage();
}); // checked
$(document).on("click", ".menu_save_ical_button", function() {
    exportICal();
}); // checked
$(document).on("click", ".menu_save_json_button", function() {
    downloadJSON();
}); // checked
$(document).on("click", ".menu_load_json_button", function() {
    $(".json_load_input").trigger("click");
}); // checked
$(document).on("change", ".json_load_input", function() {
    loadJSON();
}); // checked

// Schedule
$(document).on("click", ".schedule_cell_star", function() {
    // Update
    var les = lessons.find(x => x.id === $(this).siblings(".id").html());
    if(les.selected === true) {
        les.selected = false;
    } else {
        les.selected = true;
    }

    // Render
    storeLocalStorage();
    renderAll();
}); // checked
$(document).on("click", ".schedule_cell_bin", function() {
    // Update
    var les = lessons.find(x => x.id === $(this).siblings(".id").html());
    if(les.type === "custom") {
        lessons = lessons.filter(x => x.id !== $(this).siblings(".id").html());
    } else {
        if(les.deleted === true) {
            les.deleted = false;
        } else {
            les.deleted = true;
        }
    }

    // Render
    storeLocalStorage();
    renderAll();
}); // checked
$(document).on("click", ".lesson_add_card_button", function() {
    // New lesson
    var lesson = {
        "id": "CUST_" + makeHash("custom" + Date.now()),
        "name": $(".lesson_add_card_name").val(),
        "link": "0-" + $(".lesson_add_card_name").val(),
        "day":  +$(".lesson_add_card_day").val(),
        "week": $(".lesson_add_card_week").val(),
        "from": +$(".lesson_add_card_from").val(),
        "to": +$(".lesson_add_card_to").val(),
        "type": "custom",
        "custom_color": $(".lesson_add_card_color").val(),
        "rooms": [$(".lesson_add_card_room").val()],
        "info": $(".lesson_add_card_info").val(),
        "layer": 1,
        "selected": false,
        "deleted": false
    };

    // Check
    if(lesson.from >= lesson.to) {
        return;
    }
    if(typeof lesson.name === "undefined" || lesson.name === "") {
        return;
    }
    if(typeof lesson.rooms[0] === "undefined" || lesson.rooms[0] === "") {
        return;
    }

    // Push
    lessons.push(lesson);
    storeLocalStorage();
    renderAll();
}); // checked

///////////////////////////////////// Menu /////////////////////////////////////
async function loadStudies() {
    // Title
    $(".loading_message").html("Načítám studia...");

    // AJAX
    studies = [];
    try {
        var studiesData = await $.ajax({
            url: loadUrl,
            method: "POST",
            data: {
                "a": "s",
                "b": "",
                "c": "",
                "y": year,
            },
            async: true
        });


        // Parse BIT
        studies.push({
            "name": "BIT",
            "link": parseLinkforLoadPHP($(studiesData, fakeHtml).find("div#bc").find("li.c-programmes__item").first().find("a.b-programme__link").prop("href")),
            "subjects": {
                "com": [
                    [], [], []
                ],
                "opt": [
                    [], [], []
                ]
            }
        });

        // Parse MIT
        $(studiesData, fakeHtml).find("div#mgr").find("li.c-programmes__item").find("li.c-branches__item").each(function(i, li) {

            // only new mgr program
            if (!$(li).find("span.tag").html().startsWith('N'))
                return;

            studies.push({
                "name": "MIT-" + $(li).find("span.tag").html(),
                "link": parseLinkforLoadPHP($(li).find("a.b-branch__link").prop("href")),
                "subjects": {
                    "com": [
                        [], [], []
                    ],
                    "opt": [
                        [], [], []
                    ]
                }
            });
        });

        // Generate
        $(".menu_stud_column").html("");
        $.each(studies, function(i, stud) {
            if(stud.name === "BIT") {
                $(".menu_stud_column").append(` <div class="menu_column_row">
                                                    <input class="menu_column_row_checkbox menu_bit_checkbox" type="checkbox" value="BIT">
                                                    <div class="menu_column_row_text">BIT</div>
                                                    <div class="cleaner"></div>
                                                </div>`);
            } else {
                $(".menu_stud_column").append(` <div class="menu_column_row">
                                                    <input class="menu_column_row_radio menu_mit_radio" type="radio" name="mit_grade" value="` + stud.name + `">
                                                    <div class="menu_column_row_text">` + stud.name + `</div>
                                                    <div class="cleaner"></div>
                                                </div>`);
            }
        });

        // Parse years
        let years = [];
        $(studiesData, fakeHtml).find("select#year").find("option").each(function (i, opt) {
            years.push({value: Number($(opt).prop('value')), name: $(opt).text()});
        });

        // Generate
        $(".menu_column_row_select").html("");
        if (years.length === 0)
            $(".menu_column_row_select").append(` <option value="` + year + `" selected>` + year + `/` + (year+1) + `</option>`);
        else
            $.each(years, function(i, y) {
                $(".menu_column_row_select").append(` <option value="` + y.value + `" ` + (year === y.value ? "selected" : "") + `>` + y.name + `</option>`);
            });

        // Generate
        $(".year_select").html("");
        if (years.length === 0)
            $(".year_select").append(` <option value="` + year + `" selected>` + year + `/` + (year+1) + `</option>`);
        else
            $.each(years, function(i, y) {
                $(".year_select").append(` <option value="` + y.value + `" ` + (year === y.value ? "selected" : "") + `>` + y.name + `</option>`);
            });

        // Start load subjects
        await loadSubjects();
    } catch (e) {
        $(".loading_message").html("Chyba při načítání studií...");
    }
} // checked
async function loadSubjects(e) {
    // Title
    $(".loading_message").html("Načítám předměty studií...");

    await $.when.apply($, [...studies.map(stud => $.ajax({
        url: loadUrl,
            method: "POST",
            data: {
                "a": "u",
                "b": stud.link.split("-")[0],
                "c": stud.link.split("-")[1]
            },
            async: true
        }).done(function(e) {
            stud.subjects.com = [ [], [], [] ];
            stud.subjects.opt = [ [], [], [] ];

            // Parse
            var sem = "winter";
            var grade = 0;
            $(e, fakeHtml).find("main").first().find("div.table-responsive").first().find("tbody").each(function(o, tbody) {
                $(tbody).children("tr").each(function(p, tr) {
                    // Subject
                    var subject = {
                        "name": $(tr).children("th").html(),
                        "sem": sem,
                        "link": parseLinkforLoadPHP($(tr).children("td").first().children("a").prop("href"))
                    }

                    // Push
                    if($(tr).css("background-color") === "rgb(255, 228, 192)") {
                        stud.subjects.com[grade].push(subject);
                    } else {
                        stud.subjects.opt[grade].push(subject);
                    }
                });

                // Inc
                if(sem === "winter") {
                    sem = "summer";
                } else {
                    sem = "winter";
                    grade++;
                }
            });
        })
    )])

    // Generate
    $(".menu_com_column").html("");
    $(".menu_opt_column").html("");
    $.each(studies, function(i, stud) {
        for(var grade = 0; grade < 3; grade++) {
            // Name
            var name = stud.name;
            if(grade <= 1 || name === "BIT") {
                name += " " + (grade + 1);
            } else {
                name += " lib.";
            }

            // Com
            $(".menu_com_column").append(`  <div class="menu_column_row mrsub_` + grade + `_` + stud.name + ` hidden">
                                                <div class="menu_column_row_text_split">
                                                    <div class="menu_column_row_text_split_inner">` + name + `</div>
                                                </div>
                                            </div>`);
            $.each(stud.subjects.com[grade], function(o, sub) {
                $(".menu_com_column").append(`  <div class="menu_column_row mrsub_` + grade + `_` + stud.name + ` mrsem_` + sub.sem + ` hidden">
                                                    <input class="menu_column_row_checkbox menu_sub_checkbox" type="checkbox" value="` + sub.link + `">
                                                    <div class="menu_column_row_text">` + sub.name + `</div>
                                                    <div class="cleaner"></div>
                                                </div>`);
            });

            // Opt
            $(".menu_opt_column").append(`  <div class="menu_column_row mrsub_` + grade + `_` + stud.name + ` hidden">
                                                <div class="menu_column_row_text_split">
                                                    <div class="menu_column_row_text_split_inner">` + name + `</div>
                                                </div>
                                            </div>`);
            $.each(stud.subjects.opt[grade], function(o, sub) {
                $(".menu_opt_column").append(`  <div class="menu_column_row mrsub_` + grade + `_` + stud.name + ` mrsem_` + sub.sem + ` hidden">
                                                    <input class="menu_column_row_checkbox menu_sub_checkbox" type="checkbox" value="` + sub.link + `">
                                                    <div class="menu_column_row_text">` + sub.name + `</div>
                                                    <div class="cleaner"></div>
                                                </div>`);
            });
        }
    });

    // Done
    $(".header_info_icon").removeClass("hidden");
    $(".header_cross_icon").addClass("hidden");
    $(".menu").removeClass("hidden");
    $(".secs").removeClass("hidden");
    $(".loading_message").html("");
    $(".loading_message").addClass("hidden");

    // Render
    renderSubjects();
} // checked
function renderSubjects() {
    // Grades render
    if($(".menu_bit_checkbox:checked").length > 0) {
        $(".menu_grade_checkbox[value='0_BIT']").parent().removeClass("hidden");
        $(".menu_grade_checkbox[value='1_BIT']").parent().removeClass("hidden");
        $(".menu_grade_checkbox[value='2_BIT']").parent().removeClass("hidden");
    } else {
        $(".menu_grade_checkbox[value='0_BIT']").parent().addClass("hidden");
        $(".menu_grade_checkbox[value='1_BIT']").parent().addClass("hidden");
        $(".menu_grade_checkbox[value='2_BIT']").parent().addClass("hidden");
    }
    if($(".menu_mit_radio:checked").length > 0) {
        $(".menu_grade_checkbox[value='0_MIT']").parent().removeClass("hidden");
        $(".menu_grade_checkbox[value='1_MIT']").parent().removeClass("hidden");
    } else {
        $(".menu_grade_checkbox[value='0_MIT']").parent().addClass("hidden");
        $(".menu_grade_checkbox[value='1_MIT']").parent().addClass("hidden");
    }

    // Render groups
    var groups = [];
    var bitSelected = false;
    var mitSelected = false;
    $(".menu_grade_checkbox:checked").each(function(i, grade) {
        if(!$(grade).parent().hasClass("hidden")) {
            if($(grade).prop("value").includes("BIT")) {
                bitSelected = true;
                groups.push($(grade).prop("value").split("_")[0] + "_" + $(".menu_bit_checkbox:checked").prop("value"));
            } else {
                mitSelected = true;
                groups.push($(grade).prop("value").split("_")[0] + "_" + $(".menu_mit_radio:checked").prop("value"));
            }
        }
    });
    if(mitSelected) {
        groups.push("2_" + $(".menu_mit_radio:checked").prop("value"));
    }

    // Searches render
    if(bitSelected || mitSelected) {
        $(".menu_com_search_input").removeClass("hidden");
        $(".menu_opt_search_input").removeClass("hidden");
    } else {
        $(".menu_com_search_input").addClass("hidden");
        $(".menu_opt_search_input").addClass("hidden");
    }

    // Subjects render
    $(".menu_com_column .menu_column_row").addClass("hidden");
    $(".menu_opt_column .menu_column_row").addClass("hidden");
    $.each(groups, function(i, group) {
        $(".mrsub_" + group).removeClass("hidden");
    })
    if($(".menu_sem_radio:checked").prop("value") == "winter") {
        $(".mrsem_summer").addClass("hidden");
    } else {
        $(".mrsem_winter").addClass("hidden");
    }

    // Selected render
    $(".menu_sel_checkbox:not(:checked)").each(function(i, sub) {
        $(".menu_sub_checkbox[value='" + $(sub).prop("value") + "']").prop("checked", false);
    });
    $(".menu_sel_column").html("");
    $(".menu_sub_checkbox:checked").each(function(o, sub) {
        if(!$(sub).parent().hasClass("hidden")) {
            $(".menu_sel_column").append(`  <div class="menu_column_row">
                                                <input class="menu_column_row_checkbox menu_sel_checkbox" type="checkbox" value="` + $(sub).prop("value") + `" checked="checked">
                                                <div class="menu_column_row_text">` + $(sub).siblings(".menu_column_row_text").html() + `</div>
                                                <div class="cleaner"></div>
                                            </div>`);
        }
    });
} // checked

/////////////////////////////////// Schledule //////////////////////////////////
function loadLessons() {
    // Info
    {
        $(".header_info_icon").addClass("hidden");
        $(".header_cross_icon").addClass("hidden");
        $(".secs_main").removeClass("hidden");
        $(".secs_info").addClass("hidden");
        $(".secs_generator_info").addClass("hidden");

        $(".menu_column_row_checkbox").prop("disabled", true);
        $(".menu_column_row_radio").prop("disabled", true);
        $(".menu_button").prop("disabled", true);
        $(".menu_button").addClass("menu_button_disabled");

        $(".loading_message").html("Načítání...");
        $(".loading_message").removeClass("hidden");
        $(".secs").addClass("hidden");
    }

    // Make file
    {
        // Year
        file.year = year;

        // Sem
        file.sem = $(".menu_sem_radio:checked").prop("value");

        // Study
        file.studies = [];
        if($(".menu_bit_checkbox:checked").length > 0) {
            file.studies.push($(".menu_bit_checkbox:checked").prop("value"));
        }
        if($(".menu_mit_radio:checked").length > 0) {
            file.studies.push($(".menu_mit_radio:checked").prop("value"));
        }

        // Grades
        file.grades = [];
        $.each($(".menu_grade_checkbox:checked"), function(i, grade) {
            file.grades.push($(grade).prop("value"));
        });

        // Subjects
        file.subjects = [];
        $.each($(".menu_sel_checkbox"), function(i, sub) {
            file.subjects.push($(sub).siblings(".menu_column_row_text").html());
        });
    }

    // Subjects fill
    subjects = [];
    $(".menu_sel_checkbox").each(function(i, sub) {
        subjects.push({
            "name": $(sub).siblings(".menu_column_row_text").html(),
            "link": $(sub).prop("value"),
            "range": ""
        });
    });

    // Load
    var tempLessons = [];
    $.each(subjects, function(i, sub) {
        tempLessons = tempLessons.concat(lessons.filter(x => x.name === sub.name && x.type != "custom"));
    });
    tempLessons = tempLessons.concat(lessons.filter(x => x.type === "custom"));
    lessons = tempLessons;
    $.each(subjects, function(i, sub) {
        // Title
        $(".loading_message").html("Načítám " + sub.name + "...");

        // AJAX
        $.ajax({
            url: loadUrl,
            method: "POST",
            data: {
                "a": "u",
                "b": sub.link.split("-")[0],
                "c": sub.link.split("-")[1]
            },
            async: false,
            success: function(e) {
                // Range
                sub.range = $(e, fakeHtml).find("main").find("div.b-detail__body").find("div.grid__cell").find("p:contains('Rozsah')").parent().next().children().html() || "neznámý rozsah výuky";

                // Already loaded
                if(typeof lastLoadedSubjects.find(x => x.name === sub.name) !== "undefined") {
                    return;
                }

                // Find all enabled and disabled lesson types
                var disabledTypes = [];
                var enabledTypes = [];
                $(e, fakeHtml).find("table#schedule").find("tbody").find("tr").each(function(o, tr) {
                    if(($(tr).children("td").eq(0).html().includes("přednáška") || $(tr).children("td").eq(0).html().includes("poč. lab") || $(tr).children("td").eq(0).html().includes("cvičení") || $(tr).children("td").eq(0).html().includes("laboratoř") || $(tr).children("td").eq(0).html().includes("seminář")) &&
                       ($(tr).children("td").eq(1).html().includes("výuky") || $(tr).children("td").eq(1).html().includes("sudý") || $(tr).children("td").eq(1).html().includes("lichý") || $(tr).children("td").eq(1).html().trim().match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/))) {
                        if($(tr).children("td").eq(5).html() != "0" && !$(tr).children("td").eq(0).html().includes("*)")) {
                            enabledTypes.push($(tr).children("td").eq(0).children("span").html());
                        } else {
                            disabledTypes.push($(tr).children("td").eq(0).children("span").html());
                        }
                    }
                });

                // Remove enabled lessons from disabled lessons
                $.each(enabledTypes, function(i, type) {
                    disabledTypes = disabledTypes.filter(x => x !== type);
                });

                // Lessons
                $(e, fakeHtml).find("table#schedule").find("tbody").find("tr").each(function(o, tr) {
                    if(($(tr).children("td").eq(0).html().includes("přednáška") || $(tr).children("td").eq(0).html().includes("poč. lab") || $(tr).children("td").eq(0).html().includes("cvičení") || $(tr).children("td").eq(0).html().includes("laboratoř") || $(tr).children("td").eq(0).html().includes("seminář")) &&
                       ($(tr).children("td").eq(1).html().includes("výuky") || $(tr).children("td").eq(1).html().includes("sudý") || $(tr).children("td").eq(1).html().includes("lichý") || $(tr).children("td").eq(1).html().trim().match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) &&
                       ($(tr).children("td").eq(5).html() != "0" && !$(tr).children("td").eq(0).html().includes("*)") || disabledTypes.includes($(tr).children("td").eq(0).children("span").html()))) {
                        // Lesson
                        var lesson = {
                            "id": "",
                            "name": sub.name,
                            "link": sub.link,
                            "day":  parseDay($(tr).children("th").html()),
                            "week": parseWeek($(tr).children("td").eq(1).html()),
                            "from": parseTimeFrom($(tr).children("td").eq(3).html()),
                            "to":   parseTimeTo($(tr).children("td").eq(4).html()),
                            "group": $(tr).children("td").eq(7).html().replace("xx", "").trim(),
                            "info": $(tr).children("td").eq(8).html(),
                            "type": "unknown",
                            "rooms": [],
                            "layer": 1,
                            "selected": false,
                            "deleted": false
                        };
                        if(lesson.week == null) {
                            return;
                        }

                        // Type
                        if($(tr).children("td").eq(0).html().includes("přednáška")) {
                            lesson.type = "green";
                        } else if($(tr).children("td").eq(0).html().includes("cvičení")) {
                            lesson.type = "blue";
                        } else if($(tr).children("td").eq(0).html().includes("seminář")) {
                            lesson.type = "blue";
                        } else if($(tr).children("td").eq(0).html().includes("poč. lab")) {
                            lesson.type = "yellow";
                        } else if($(tr).children("td").eq(0).html().includes("laboratoř")) {
                            lesson.type = "yellow";
                        }

                        // Rooms
                        $.each($(tr).children("td").eq(2).children("a"), function(p, a) {
                            lesson.rooms.push($(a).html().trim());
                        });
                        if(lesson.rooms.includes("E112") && lesson.rooms.includes("E104") && lesson.rooms.includes("E105")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "E112" && x !== "E104" && x !== "E105");
                            lesson.rooms.push("E112+4,5");
                        }
                        if(lesson.rooms.includes("E112") && lesson.rooms.includes("E104")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "E112" && x !== "E104");
                            lesson.rooms.push("E112+4");
                        }
                        if(lesson.rooms.includes("E112") && lesson.rooms.includes("E105")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "E112" && x !== "E105");
                            lesson.rooms.push("E112+5");
                        }
                        if(lesson.rooms.includes("D105") && lesson.rooms.includes("D0206") && lesson.rooms.includes("D0207")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "D105" && x !== "D0206" && x !== "D0207");
                            lesson.rooms.push("D105+6,7");
                        }
                        if(lesson.rooms.includes("D105") && lesson.rooms.includes("D0206")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "D105" && x !== "D0206");
                            lesson.rooms.push("D105+6");
                        }
                        if(lesson.rooms.includes("D105") && lesson.rooms.includes("D0207")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "D105" && x !== "D0207");
                            lesson.rooms.push("D105+7");
                        }
                        if(lesson.rooms.includes("N103") && lesson.rooms.includes("N104") && lesson.rooms.includes("N105")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "N103" && x !== "N104" && x !== "N105");
                            lesson.rooms.push("N103,4,5");
                        }
                        if(lesson.rooms.includes("N103") && lesson.rooms.includes("N104")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "N103" && x !== "N104");
                            lesson.rooms.push("N103,4");
                        }
                        if(lesson.rooms.includes("N104") && lesson.rooms.includes("N105")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "N104" && x !== "N105");
                            lesson.rooms.push("N104,5");
                        }

                        // ID
                        lesson.id = "LOAD_" + makeHash(lesson.name + ";" + lesson.day + ";" + lesson.week + ";" + lesson.from + ";" + lesson.to + ";" + lesson.type + ";" + JSON.stringify(lesson.rooms));

                        // Push
                        lessons.push(lesson);
                    }
                });
            }
        });
    });
    lastLoadedSubjects = subjects;

    // Parse ranges
    ranges = [];
    $.each(subjects, function(i, sub) {
        // Split ranges
        var rangeRaw = sub.range;
        var greenRange = 0;
        var blueRange = 0;
        var yellowRange = 0;

        rangeRaw = rangeRaw.replaceAll("\\n", "");
        rangeRaw = rangeRaw.replaceAll("hod. ", "");
        rangeRaw = rangeRaw.trim();
        $.each([...rangeRaw.matchAll(/(?<=<li>)[^<]+(?=<\/li)/gm)], function(i, rang) {
            rang = rang[0].trim();

            if(rang.split(" ")[1].trim() === "přednášky") {
                greenRange = +rang.split(" ")[0].trim();
            } else if(rang.split(" ")[1].trim() === "cvičení") {
                blueRange = +rang.split(" ")[0].trim();
            } else if(rang.split(" ")[1].trim() === "seminář") {
                blueRange = +rang.split(" ")[0].trim();
            } else if(rang.split(" ")[1].trim() === "pc") {
                yellowRange = +rang.split(" ")[0].trim();
            } else if(rang.split(" ")[1].trim() === "laboratoře") {
                yellowRange = +rang.split(" ")[0].trim();
            }
        });

        // Find lengths
        var greenLength = 0;
        var blueLength = 0;
        var yellowLength = 0;

        greenLength = greenRange / 13;
        var blueLesson = lessons.find(x => x.name === sub.name && x.type === "blue");
        if(typeof blueLesson != "undefined" && blueRange > 0) {
            blueLength = blueLesson.to - blueLesson.from;
        }
        var yellowLesson = lessons.find(x => x.name === sub.name && x.type === "yellow");
        if(typeof yellowLesson != "undefined" && yellowRange > 0) {
            yellowLength = yellowLesson.to - yellowLesson.from;
        }

        // Calculate ranges
        var greenCount = 0;
        var blueCount = 0
        var yellowCount = 0
        if(greenLength > 0) {
            greenCount = 13;
        }
        if(blueLength > 0) {
            blueCount = blueRange / blueLength;
        }
        if(yellowLength > 0) {
            yellowCount = yellowRange / yellowLength;
        }

        // Push
        var range = {
            "name": sub.name,
            "link": sub.link,
            "raw": sub.range.replaceAll("\\n", "").trim(),
            "greenLength": greenLength,
            "blueLength": blueLength,
            "yellowLength": yellowLength,
            "greenCount": greenCount,
            "blueCount": blueCount,
            "yellowCount": yellowCount
        };
        ranges.push(range);
    });

    // Done
    $(".header_info_icon").removeClass("hidden");

    $(".menu_column_row_checkbox").prop("disabled", false);
    $(".menu_column_row_radio").prop("disabled", false);
    $(".menu_button").prop("disabled", false);
    $(".menu_button").removeClass("menu_button_disabled");

    $(".loading_message").html("");
    $(".loading_message").addClass("hidden");
    $(".secs").removeClass("hidden");

    // Render
    renderAll();
} // checked

function mergeLessons(lessons) {
    var lesson = lessons[0];

    var rooms = [];
    var lecturers = [];
    var weeks = [];

    $.each(lessons, function(i, l) {
        rooms = rooms.concat(l.rooms);
        lecturers = lecturers.concat(l.info.split(", "));
        weeks = weeks.concat(l.week.split(" "));
    });

    // Remove duplicates
    rooms = rooms.filter(function(item, pos) {
        return rooms.indexOf(item) == pos;
    });
    lecturers = lecturers.filter(function(item, pos) {
        return lecturers.indexOf(item) == pos;
    });
    weeks = weeks.filter(function(item, pos) {
        return weeks.indexOf(item) == pos;
    });

    // Sort
    weeks.sort(function(a, b) {
        return a - b; // math on strings seems to not cause any issues
    });

    lesson.rooms = rooms;
    lesson.info = lecturers.join(", ");
    lesson.week = weeks.join(" ");

    return lesson;
} // checked

function renderAll() {
    // Disect
    var lessonsDisection = {};
    $.each(lessons, function(i, lesson) {
        // we disect the lessons into groups of possibly same lessons
        // the lessons differ only in the week and the room and the lecturer -> probably the same lesson
        // the cases when the lessons are possibly different:
        // - !!! the lessons are in different rooms -> unnecessary detail for planing, not preventing merge
        // - the lessons are in different weeks -> the lessons are different, the merge will be prevented
        // - the lessons are from different lecturers -> probably the same lessons with just the change of lecturer, not preventing merge
        var key = lesson.name + ";" + lesson.day + ";" + lesson.from + ";" + lesson.to + ";" + lesson.type;
        if(typeof lessonsDisection[key] == "undefined") {
            lessonsDisection[key] = [];
        }
        lessonsDisection[key].push(lesson);
    });

    // Merge
    lessons = [];
    $.each(lessonsDisection, function(i, lessonsDisection) {
        // the assumption:
        // - the otherLessons is non-empty:
        //   -> this means that there is no split of the lessons into odd and even weeks
        //   -> the lessons are probably the same, so we merge them all into one lesson
        // - the otherLessons is empty:
        //   -> this means that there is a split of the lessons into odd and even weeks
        //   -> we merge even with even and odd with odd lessons
        //   (NOTE - TODO?) maybe this split is incidental and it should be merged into one lesson - for example green
        var oddLessons = lessonsDisection.filter(x => isOddWeek(x.week, 1));
        var evenLessons = lessonsDisection.filter(x => isEvenWeek(x.week, 1));
        var otherLessons = lessonsDisection.filter(x => !isOddWeek(x.week, 1) && !isEvenWeek(x.week, 1));

        if(otherLessons.length > 0) {
            lessons.push(mergeLessons(otherLessons.concat(oddLessons).concat(evenLessons)));
        } else {
            if(oddLessons.length > 0) {
                lessons.push(mergeLessons(oddLessons));
            }
            if(evenLessons.length > 0) {
                lessons.push(mergeLessons(evenLessons));
            }
        }
    });

    $.each(lessons, function(i, lesson) {
        lesson.week = lesson.week.replaceAll("1. 2. 3. 4. 5. 6. 7. 8. 9. 10. 11. 12. 13.", "");
    });

    // Sort
    lessons.sort(function(a, b) {
        if(a.type === "green" && b.type !== "green") {
            return -1;
        } else if(a.type !== "green" && b.type === "green") {
            return 1;
        }

        if(a.type === "blue" && b.type !== "blue") {
            return -1;
        } else if(a.type !== "blue" && b.type === "blue") {
            return 1;
        }

        if(a.name < b.name) {
            return -1;
        } else if(a.name > b.name) {
            return 1;
        }

        return 0;
    });

    // Render
    renderSchedule();
    renderScheduleFin();
    renderRanges();
} // checked
function renderSchedule() {
    // Push lessons
    var schedule = [[], [], [], [], []];
    $.each(lessons, function(i, les) {
        // Reinit
        les.layer = 1;

        // Collisions
        do {
            var collison = false;
            $.each(schedule[les.day], function(o, lesX) {
                if(les.layer === lesX.layer) {
                    if(doLessonsCollide(les.from, les.to, lesX.from, lesX.to)) {
                        collison = true;
                        les.layer++;
                    }
                }
            });
        } while(collison === true);

        // Push
        schedule[les.day].push(les);
    });

    // Layers count
    var scheduleLayersCount = [1, 1, 1, 1, 1];
    for(d = 0; d < 5; d++) {
        var maxLayer = 1;
        $.each(schedule[d], function(i, les) {
            if(les.layer > maxLayer) {
                maxLayer = les.layer;
            }
        });
        scheduleLayersCount[d] = maxLayer;
    }

    // Prepare schedule rows
    for(d = 0; d < 5; d++) {
        $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").html("");
        for(l = 0; l < scheduleLayersCount[d]; l++) {
            $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").append(`<div class="schedule_row_layer"></div>`);
        }

        $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_header").css("line-height", (scheduleLayersCount[d] * 90 + 6) + "px");
    }

    // Generation of cells
    for(d = 0; d < 5; d++) {
        var fullLength = +$(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").width();

        $.each(schedule[d], function(i, les) {
            var length = ((les.to - les.from) * (fullLength / 14)) - 6 - 6;
            var left = (les.from * (fullLength / 14)) + 3;

            var classes = "";
            if(les.type === "green") {
                classes += "schedule_cell_type_green ";
            } else if(les.type === "blue") {
                classes += "schedule_cell_type_blue ";
            } else if(les.type === "yellow") {
                classes += "schedule_cell_type_yellow ";
            } else if(les.type === "custom") {
                classes += "schedule_cell_type_" + les.custom_color + " ";
            }
            if(isOddWeek(les.week)) {
                classes += "schedule_cell_week_odd ";
            } else if(isEvenWeek(les.week)) {
                classes += "schedule_cell_week_even ";
            }
            if(les.selected === true) {
                classes += "schedule_cell_selected ";
            }
            if(les.deleted === true) {
                classes += "schedule_cell_deleted ";
            }

            var rooms = "";
            $.each(les.rooms, function(i, room) {
                rooms += room + " ";
            });

            var layerDiv = $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").children(".schedule_row_layer").eq(les.layer - 1);
            $(layerDiv).append(`<div class="schedule_cell ` + classes + `" style="left: ` + left + `px; width: ` + length + `px">
                                    <div class="schedule_cell_name"><a target="_blank" href="https://www.fit.vut.cz/study/course/` + les.link.split("-")[1] + `">` + les.name + `</a></div>
                                    <div class="schedule_cell_rooms">` + rooms + `</div>
                                    <div class="schedule_cell_desc">` + les.week + `</div>
                                    <div class="schedule_cell_info" title="` + (typeof les.info !== "undefined" ? les.info : "") + `">` + (typeof les.info !== "undefined" ? les.info : "") + `</div>
                                    <div class="schedule_cell_star"></div>
                                    <div class="schedule_cell_bin"></div>
                                    <div class="id hidden">` + les.id + `</div>
                                </div>`);
        });
    }
} // checked
function renderScheduleFin() {
    // Push lessons
    var schedule = [[], [], [], [], []];
    $.each(lessons, function(i, les) {
        if(les.selected == true) {
            // Reinit
            les.layer = 1;

            // Collisions
            do {
                var collison = false;
                $.each(schedule[les.day], function(o, lesX) {
                    if(les.layer === lesX.layer) {
                        if(doLessonsCollide(les.from, les.to, lesX.from, lesX.to)) {
                            collison = true;
                            les.layer++;
                        }
                    }
                });
            } while(collison === true);

            // Push
            schedule[les.day].push(les);
        }
    });

    // Layers count
    var scheduleLayersCount = [1, 1, 1, 1, 1];
    for(d = 0; d < 5; d++) {
        var maxLayer = 1;
        $.each(schedule[d], function(i, les) {
            if(les.layer > maxLayer) {
                maxLayer = les.layer;
            }
        });
        scheduleLayersCount[d] = maxLayer;
    }

    // Prepare schedule rows
    for(d = 0; d < 5; d++) {
        $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").html("");
        for(l = 0; l < scheduleLayersCount[d]; l++) {
            $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").append(`<div class="schedule_row_layer"></div>`);
        }

        $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_header").css("line-height", (scheduleLayersCount[d] * 90 + 6) + "px");
    }

    // Generation of cells
    for(d = 0; d < 5; d++) {
        var fullLength = +$(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").width();

        $.each(schedule[d], function(i, les) {
            var length = ((les.to - les.from) * (fullLength / 14)) - 6 - 6;
            var left = (les.from * (fullLength / 14)) + 3;

            var classes = "";
            if(les.type === "green") {
                classes += "schedule_cell_type_green ";
            } else if(les.type === "blue") {
                classes += "schedule_cell_type_blue ";
            } else if(les.type === "yellow") {
                classes += "schedule_cell_type_yellow ";
            } else if(les.type === "custom") {
                classes += "schedule_cell_type_" + les.custom_color + " ";
            }
            if(isOddWeek(les.week)) {
                classes += "schedule_cell_week_odd ";
            } else if(isEvenWeek(les.week)) {
                classes += "schedule_cell_week_even ";
            }

            var rooms = "";
            $.each(les.rooms, function(i, room) {
                rooms += room + " ";
            });

            var layerDiv = $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").children(".schedule_row_layer").eq(les.layer - 1);
            $(layerDiv).append(`<div class="schedule_cell schedule_cell_selected ` + classes + `" style="left: ` + left + `px; width: ` + length + `px">
                                    <div class="schedule_cell_name"><a target="_blank" href="https://www.fit.vut.cz/study/course/` + les.link.split("-")[1] + `">` + les.name + `</a></div>
                                    <div class="schedule_cell_rooms">` + rooms + `</div>
                                    <div class="schedule_cell_desc">` + les.week + `</div>
                                    <div class="schedule_cell_info" title="` + (typeof les.info !== "undefined" ? les.info : "") + `">` + (typeof les.info !== "undefined" ? les.info : "") + `</div>
                                </div>`)
        });
    }
} // checked
function renderRanges() {
    $(".ranges").html("");
    $.each(ranges, function(i, rang) {
        // Sum values
        var sumGreenValue = 0;
        var sumBlueValue = 0;
        var sumYellowValue = 0;
        $.each(lessons.filter(x => x.name == rang.name && x.selected === true && x.type == "green"), function(o, les) {
            sumGreenValue += les.to - les.from;
        });
        $.each(lessons.filter(x => x.name == rang.name && x.selected === true && x.type == "blue"), function(o, les) {
            sumBlueValue += les.to - les.from;
        });
        $.each(lessons.filter(x => x.name == rang.name && x.selected === true && x.type == "yellow"), function(o, les) {
            sumYellowValue += les.to - les.from;
        });

        $(".ranges").append(`   <div class="range">
                                    <a target="_blank" href="https://www.fit.vut.cz/study/course/` + rang.link.split("-")[1] + `">
                                        <div class="range_name">` + rang.name + `</div>
                                    </a>
                                    <div class="range_content">
                                        <div class="range_raw">` + rang.raw + `</div>
                                        <div class="range_columns">
                                            <div class="range_column">
                                                <div class="range_column_title">Počet hodin lekce týdně:</div>` +
                                                (rang.greenLength > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Přednášky:</div>
                                                        <div class="range_row_value">` + rang.greenLength + ` hod. týdně</div>
                                                        ` + ((sumGreenValue === rang.greenLength) ? `<div class="range_row_icon range_row_icon_check"></div>` : `<div class="range_row_icon range_row_icon_cross"></div><div class="range_row_mes_red">vybráno ` + sumGreenValue + `</div>`) + `
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                                (rang.blueLength > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Cvičení:</div>
                                                        <div class="range_row_value">` + rang.blueLength + ` hod. týdně</div>
                                                        ` + ((sumBlueValue === rang.blueLength) ? `<div class="range_row_icon range_row_icon_check"></div>` : `<div class="range_row_icon range_row_icon_cross"></div><div class="range_row_mes_red">vybráno ` + sumBlueValue + `</div>`) + `
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                                (rang.yellowLength > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Laboratoře:</div>
                                                        <div class="range_row_value">` + rang.yellowLength + ` hod. týdně</div>
                                                        ` + ((sumYellowValue === rang.yellowLength) ? `<div class="range_row_icon range_row_icon_check"></div>` : `<div class="range_row_icon range_row_icon_cross"></div><div class="range_row_mes_red">vybráno ` + sumYellowValue + `</div>`) + `
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                            `</div>
                                            <div class="range_column">
                                                <div class="range_column_title">Odhad počtu lekcí za semestr:</div>` +
                                                (rang.greenCount > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Přednášky:</div>
                                                        <div class="range_row_value">` + rang.greenCount + `x</div>
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                                (rang.blueCount > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Cvičení:</div>
                                                        <div class="range_row_value">` + rang.blueCount + `x</div>
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                                (rang.yellowCount > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Laboratoře:</div>
                                                        <div class="range_row_value">` + rang.yellowCount + `x</div>
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                            `</div>
                                            <div class="cleaner"></div>
                                        </div>
                                    </div>
                                    <div class="cleaner"></div>
                                </div>`);
    });
} // checked

//////////////////////////////////// SAVING ////////////////////////////////////
function makeFile() {
    // Lessons
    file.custom = [];
    file.selected = [];
    file.deleted = [];
    $.each(lessons, function(i, les) {
        if(les.type === "custom") {
            file.custom.push(les);
        }
        if(les.selected) {
            file.selected.push(les.id);
        }
        if(les.deleted) {
            file.deleted.push(les.id);
        }
    });
} // checked
function restoreFile() {
    // Year
    if(file.year) {
        year = file.year;
        $(".year_select").val(year);
    }

    // Sem
    $(".menu_sem_radio[value='" + file.sem +"']").prop("checked", true);

    // Study
    $(".menu_bit_checkbox").prop("checked", false);
    $(".menu_mit_radio").prop("checked", false);
    $.each(file.studies, function(i, stud) {
        $(".menu_bit_checkbox[value='" + stud +"']").prop("checked", true);
        $(".menu_mit_radio[value='" + stud +"']").prop("checked", true);
    });

    // Grades
    $(".menu_grade_checkbox").prop("checked", false);
    $.each(file.grades, function(i, grade) {
        $(".menu_grade_checkbox[value='" + grade +"']").prop("checked", true);
    });

    // Subjects
    $(".menu_sub_checkbox").prop("checked", false);
    $(".menu_com_column .menu_column_row").each(function(i, sub) {
        if($(sub).children(".menu_column_row_text").length > 0) {
            if(file.subjects.includes($(sub).children(".menu_column_row_text").html())) {
                $(sub).children(".menu_sub_checkbox").prop("checked", true);
            }
        }
    });
    $(".menu_opt_column .menu_column_row").each(function(i, sub) {
        if($(sub).children(".menu_column_row_text").length > 0) {
            if(file.subjects.includes($(sub).children(".menu_column_row_text").html())) {
                $(sub).children(".menu_sub_checkbox").prop("checked", true);
            }
        }
    });

    // Menu
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
    lastLoadedSubjects = [];
    lessons = [];
    loadLessons();

    // Lessons
    $.each(file.custom, function(i, les) {
        lessons.push(les);
    });
    $.each(file.selected, function(i, les) {
        if(typeof lessons.find(x => x.id === les) != "undefined") {
            lessons.find(x => x.id === les).selected = true;
        }
    });
    $.each(file.deleted, function(i, les) {
        if(typeof lessons.find(x => x.id === les) != "undefined") {
            lessons.find(x => x.id === les).deleted = true;
        }
    });
    renderAll();
} // checked

function downloadJSON() {
    // MakeFile
    makeFile();

    // Save
    var fileJSON = JSON.stringify(file);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileJSON));
    element.setAttribute('download', "schedule.json");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
} // checked
function loadJSON() {
    // No file
    if(!$(".json_load_input")[0].files[0]) {
        $(".secs").addClass("hidden");
        $(".loading_message").removeClass("hidden");
        $(".loading_message").html("Nevybrán žádný soubor");
        $(".menu_button").prop("disabled", true);
        $(".menu_button").addClass("menu_button_disabled");

        setTimeout(function() {
            $(".loading_message").html("");
            $(".loading_message").addClass("hidden");
            $(".secs").removeClass("hidden");
            $(".menu_button").prop("disabled", false);
            $(".menu_button").removeClass("menu_button_disabled");
        }, 2000);
    }

    var reader = new FileReader();
    reader.readAsText($(".json_load_input")[0].files[0], "UTF-8");
    reader.onload = function(e) {
        try {
            file = JSON.parse(e.target.result);
            restoreFile();
            storeLocalStorage();
        } catch(e) {
            // Parse error
            $(".secs").addClass("hidden");
            $(".loading_message").removeClass("hidden");
            $(".loading_message").html("Chyba při parsování souboru");
            $(".menu_button").prop("disabled", true);
            $(".menu_button").addClass("menu_button_disabled");

            setTimeout(function() {
                $(".loading_message").html("");
                $(".loading_message").addClass("hidden");
                $(".secs").removeClass("hidden");
                $(".menu_button").prop("disabled", false);
                $(".menu_button").removeClass("menu_button_disabled");
            }, 2000);
        }
    }
    reader.onerror = function (e) {
        // Read error
        $(".secs").addClass("hidden");
        $(".loading_message").removeClass("hidden");
        $(".loading_message").html("Chyba při čtení souboru");
        $(".menu_button").prop("disabled", true);
        $(".menu_button").addClass("menu_button_disabled");

        setTimeout(function() {
            $(".loading_message").html("");
            $(".loading_message").addClass("hidden");
            $(".secs").removeClass("hidden");
            $(".menu_button").prop("disabled", false);
            $(".menu_button").removeClass("menu_button_disabled");
        }, 2000);
    }
} // checked

function getLessonCategory(les) {
    var isCustom = les.type == "custom";
    var color = isCustom ? les.custom_color : les.type;
    var out = "";
    if(color == "green") out += "Přednáška";
    else if(color == "blue") out += "Cvičení";
    else if(color == "yellow") out += "Laboratoř";
    if(isCustom) out += (out != "" ? "," : "") + "Vlastní hodina";
    return out;
} // checked
function generateICalEvent(les, fromDatetime, toDatetime, weeklyInterval, count=1) {
    var fromDatetimeIcal = getIcalDatetime(fromDatetime);
    var toDatetimeIcal = getIcalDatetime(toDatetime);
    var typeString = getTypeString(les.type);
    var createdDatetime = getIcalDatetime(new Date);

    // Event header
    let contents = "BEGIN:VEVENT\r\n";
    contents += "UID:" + fromDatetime + "-" + les.id + "\r\n";
    contents += "DTSTAMP;TZID=Europe/Prague:" + createdDatetime + "\r\n";

    // Datetimes
    contents += "DTSTART;TZID=Europe/Prague:" + fromDatetimeIcal + "\r\n";
    contents += "DTEND;TZID=Europe/Prague:" + toDatetimeIcal + "\r\n";
    if (weeklyInterval != 0) {
        contents += "RRULE:FREQ=WEEKLY;INTERVAL=" + weeklyInterval + ";COUNT=" + count + "\r\n";
    }

    // Additional info
    contents += "SUMMARY:" + les.name + " " + typeString + "\r\n";
    contents += "LOCATION:" + les.rooms.join(" ") + "\r\n";
    contents += "URL:https://www.fit.vut.cz/study/course/" + les.link + "\r\n";
    if(getLessonCategory(les) != "") contents += "CATEGORIES:" + getLessonCategory(les) + "\r\n"; // custom color

    // Event footer
    contents += "END:VEVENT\r\n";

    return contents;
} // checked
function exportICal() {
    var contents = "";

    // iCalendar header
    contents += "BEGIN:VCALENDAR\r\n";
    contents += "VERSION:2.0\r\n";
    contents += "PRODID:-//kubosh/fitsch//NONSGML v1.0//EN\r\n";

    // Export all events from final schedule
    $.each(lessons, function(j, les) {
        if(!les.selected) return;
        // Calculate correct datetimes from les object
        if(les.week.includes("sudý")) {
            var fromDatetime = getDatetimeFromHourNumber(les.from, les.day, 2, year, file.semester == "summer");
            var toDatetime = getDatetimeFromHourNumber(les.to, les.day, 2, file.year, file.semester == "summer");
            toDatetime = new Date(toDatetime.getTime() - 10 * 1000 * 60);
            contents += generateICalEvent(les, fromDatetime, toDatetime, 2, 6);
        } else if(les.week.includes("lichý")) {
            var fromDatetime = getDatetimeFromHourNumber(les.from, les.day, 1, year, file.semester == "summer");
            var toDatetime = getDatetimeFromHourNumber(les.to, les.day, 1, file.year, file.semester == "summer");
            toDatetime = new Date(toDatetime.getTime() - 10 * 1000 * 60);
            contents += generateICalEvent(les, fromDatetime, toDatetime, 2, 7);
        } else if(les.week == "") {
            var fromDatetime = getDatetimeFromHourNumber(les.from, les.day, 1, year, file.semester == "summer");
            var toDatetime = getDatetimeFromHourNumber(les.to, les.day, 1, file.year, file.semester == "summer");
            toDatetime = new Date(toDatetime.getTime() - 10 * 1000 * 60);
            contents += generateICalEvent(les, fromDatetime, toDatetime, 1, 13);
        } else {
            var weeks = les.week.split(" ");
            $.each(weeks, function(i, week) {
                var fromDatetime = getDatetimeFromHourNumber(les.from, les.day, Number(week), year, file.semester == "summer");
                var toDatetime = getDatetimeFromHourNumber(les.to, les.day, Number(week), file.year, file.semester == "summer");
                toDatetime = new Date(toDatetime.getTime() - 10 * 1000 * 60);
                contents += generateICalEvent(les, fromDatetime, toDatetime, 0);
            });
        }
    })

    // iCalendar footer
    contents += "END:VCALENDAR";

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
    element.setAttribute('download', "schedule.ics");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
} // checked
function storeLocalStorage() {
    // Makefile
    makeFile();

    // Store
    localStorage.setItem("schedule", JSON.stringify(file));
} // checked
function loadLocalStorage() {
    if(localStorage.getItem("schedule") != null) {
        // Load
        try {
            file = JSON.parse(localStorage.getItem("schedule"));
        } catch {}

        // Restore
        restoreFile();
    }
} // checked

//////////////////////////////////// Helpers ///////////////////////////////////
function parseLinkforLoadPHP(link) {
    var linkArray = link.split("/");
    linkArray = linkArray.filter(x => x != "");
    return linkArray[linkArray.length - 2] + "-" + linkArray[linkArray.length - 1];
} // checked
function parseDay(day) {
    if(day === "Po") {
        return 0;
    } else if(day === "Út") {
        return 1;
    } else if(day === "St") {
        return 2;
    } else if(day === "Čt") {
        return 3;
    } else if(day === "Pá") {
        return 4;
    }
} // checked
function parseWeek(week) {
    week = week.replace("výuky", "");
    week = week.replaceAll(",", "");
    week = week.trim();
    if(week.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
        var weekNum =  getSemesterWeekFromDate(new Date(week));
        if(weekNum < 1) return null;
        return weekNum + ".";
    }
    return week;
} // checked
function parseTimeFrom(time) {
    var hours = +time.split(":")[0];
    return hours - 7;
} // checked
function parseTimeTo(time) {
    var hours = +time.split(":")[0] + 1;
    return hours - 7;
} // checked
function doLessonsCollide(a, b, x, y) {
    if(x > a && x < b) {
        return true;
    }
    if(y > a && y < b) {
        return true;
    }
    if(a > x && a < y) {
        return true;
    }
    if(b > x && b < y) {
        return true;
    }
    if(a == x && b == y) {
        return true;
    }
    return false;
} // checked
function makeHash(string) {
    var hash = 0, i, chr;

    if(string.length === 0) {
        return hash;
    }
    for(i = 0; i < string.length; i++) {
        chr   = string.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0;
    }

    if(Number.isInteger(hash)) {
        hash = Math.abs(hash);
    }
    return hash.toString();
} // checked
function padNumber(number) {
    return (number < 10) ? ("0" + number) : number;
} // checked
function changeTimezone(date, ianatz) {
    // suppose the date is 12:00 UTC
    var invdate = new Date(date.toLocaleString('en-US', {
        timeZone: ianatz
    }));

    // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours
    var diff = date.getTime() - invdate.getTime();

    // so 12:00 in Toronto is 17:00 UTC
    return new Date(date.getTime() - diff); // needs to substract
} // checked (https://stackoverflow.com/a/53652131/7361496)
function getIcalDatetime(date) {
    date = changeTimezone(date, "Europe/Prague");
    var buffer = "";
    buffer += date.getFullYear();
    buffer += padNumber(date.getMonth() + 1);
    buffer += padNumber(date.getDate());
    buffer += "T";
    buffer += padNumber(date.getHours());
    buffer += padNumber(date.getMinutes());
    buffer += padNumber(date.getSeconds());
    return buffer;
} // checked
function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return week number
    return weekNo;
} // checked (https://stackoverflow.com/a/6117889/7361496)
function getDatetimeFromHourNumber(hour, dayIndex, week, year, isSummer) {
    hour += 7; // Convert to actual hour
    if(isSummer) {
        year += 1;
    }
    var date = new Date(isSummer ? summerStart[year] : winterStart[year]);
    date.setDate(date.getDate() + (week-1) * 7 + dayIndex);
    date.setFullYear(year);
    date.setHours(hour, 0, 0, 0);

    return date;
} // checked
function getTypeString(type) {
    switch(type) {
        case "green":
            return "Přednáška";
        case "blue":
            return "Cvičení";
        case "yellow":
            return "Laboratoř";
        case "custom":
            return "Vlastní hodina";
        default:
            return "Jiný typ";
    }
} // checked
function isOddWeek(week, minOddLessons = 3) {
    if(week.includes("lichý")) return true;
    // consits of numbers, dots and spaces
    if(week.match(/^[\d.\s]+$/)) {
        var oddNumbers = 0;
        var evenNumbers = 0;
        var numbers = week.split(" ");
        for(var i = 0; i < numbers.length; i++) {
            // regex keep only numbers
            var number = numbers[i].replace(/\D/g,'');
            if(number == "") continue;
            if(number % 2 == 0) {
                evenNumbers++;
            } else {
                oddNumbers++;
            }
        }
        // it seems like every semester starts with even week, so even numbers imply odd week
        if(evenNumbers >= minOddLessons && oddNumbers == 0) return true;
    }
    return false;
} // checked
function isEvenWeek(week, minEvenLessons = 3) {
    if(week.includes("sudý")) return true;
    // consits of numbers, dots and spaces
    if(week.match(/^[\d.\s]+$/)) {
        var oddNumbers = 0;
        var evenNumbers = 0;
        var numbers = week.split(" ");
        for(var i = 0; i < numbers.length; i++) {
            // regex keep only numbers
            var number = numbers[i].replace(/\D/g,'');
            if(number == "") continue;
            if(number % 2 == 0) {
                evenNumbers++;
            } else {
                oddNumbers++;
            }
        }
        // it seems like every semester starts with even week, so odd numbers imply even week
        if(evenNumbers == 0 && oddNumbers >= minEvenLessons) return true;
    }
    return false;
} // checked
function getSemesterWeekFromDate(date) {
    var dateWeek = getWeekNumber(date);
    var year = date.getFullYear();
    var winterStartWeek = getWeekNumber(new Date(winterStart[year]));
    var summerStartWeek = getWeekNumber(new Date(summerStart[year]));
    var relativeWinterWeek = dateWeek - winterStartWeek + 1;
    var relativeSummerWeek = dateWeek - summerStartWeek + 1;
    if(relativeWinterWeek >= 1 && relativeWinterWeek <= 13) {
        return relativeWinterWeek;
    } else if(relativeSummerWeek >= 1 && relativeSummerWeek <= 13) {
        return relativeSummerWeek;
    } else {
        console.warn("Date " + date + " is not in any semester week, so will be ignored");
        return -1;
    }
} // checked