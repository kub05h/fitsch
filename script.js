var newPlanYear = 2019;                                                         // První rok nového plánu

var actWorkingSubjectIndex = 0;                                                 // Aktuálně parsovaný předmět
var subjectsAll = [[[[], []],[[], []],[[], []]],[[[], []],[[], []],[[], []]]];  // List předmětů
var subjectsWorking = [];                                                       // Vybrané předměty

var schedule = [[], [], [], [], []];                                         // Pole pracovního rozvrhu
var scheduleFin = [[], [], [], [], []];                                         // Pole výsledného rozvrhu
var scheduleLayersCount = [0, 0, 0, 0, 0];                                   // Počet vrstev v pracovním rozvrhu
var scheduleFinLayersCount = [0, 0, 0, 0, 0];                                   // POčet vrstev ve výsledném rozvrhu

var scheduleCustom = [[], [], [], [], []];                                      // Pole vlastních hodin
var scheduleIndexes = [];                                                       // Indexy vybraných hodin
var scheduleFaded = [];                                                         // Potmavené hodiny


















/////////////////////////////////// Variables //////////////////////////////////
var studies = [];                    // Array of loaded studies with subjects
var subjects = [];                   // Array of selected subjects
var lessons = [];                    // Array of lessons of selected subjects
var ranges = [];                     // Array of ranges of selected subjects
var schedule = [[], [], [], [], []]; // Array of schledule days


///////////////////////////////////// Main /////////////////////////////////////
$(document).ready(function() {
    // Semester radio auto select
    var d = new Date();
    if(d.getMonth() === 11 || d.getMonth() < 4) {
        $(".menu_sem_radio[value='summer']").prop("checked", true);
    } else {
        $(".menu_sem_radio[value='winter']").prop("checked", true);
    }

    // Start menu load
    loadStudies();
}); //checked

//////////////////////////////////// Events ////////////////////////////////////
// Header
$(document).on("click", ".header_info_icon", function() {
    $(".header_info_icon").addClass("hidden");
    $(".header_cross_icon").removeClass("hidden");

    $(".secs_main").addClass("hidden");
    $(".secs_info").removeClass("hidden");
}); //checked
$(document).on("click", ".header_cross_icon", function() {
    $(".header_info_icon").removeClass("hidden");
    $(".header_cross_icon").addClass("hidden");

    $(".secs_main").removeClass("hidden");
    $(".secs_info").addClass("hidden");
}); //checked
$(document).on("click", ".menu_menu_icon", function() {
    $(".menu_menu_icon").addClass("hidden");

    $(".secs").removeClass("secs_menu_hidden");
    $(".menu").removeClass("hidden");
}); //checked
$(document).on("click", ".menu_cross_icon", function() {
    $(".menu_menu_icon").removeClass("hidden");

    $(".secs").addClass("secs_menu_hidden");
    $(".menu").addClass("hidden");
}); //checked

// Menu
$(document).on("click", ".menu_sem_radio", function() {
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); //checked
$(document).on("click", ".menu_bit_checkbox", function() {
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); //checked
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
}); //checked
$(document).on("click", ".menu_grade_checkbox", function() {
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); //checked
$(document).on("click", ".menu_sub_checkbox", function() {
    renderSubjects();
}); //checked
$(document).on("click", ".menu_sel_checkbox", function() {
    renderSubjects();
}); //checked
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
}); //checked
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
}); //checked
$(document).on("click", ".content_header_elem", function() {
    $(".content_header_elem").removeClass("content_header_elem_selected");
    $(".sec").addClass("left-100");

    $(this).addClass("content_header_elem_selected");
    if($(this).hasClass("ch_0")) {
        $(".se_0").removeClass("left-100");
    } else if($(this).hasClass("ch_1")) {
        $(".se_1").removeClass("left-100");
    } else if($(this).hasClass("ch_2")) {
        $(".se_2").removeClass("left-100");
    }
});

// Controls
$(document).on("click", ".menu_submit_button", function() {
    $(".header_info_icon").removeClass("hidden");
    $(".header_cross_icon").addClass("hidden");
    $(".secs_main").removeClass("hidden");
    $(".secs_info").addClass("hidden");

    $(".menu_column_row_checkbox").prop("disabled", true);
    $(".menu_column_row_radio").prop("disabled", true);
    $(".menu_submit_button").prop("disabled", true);
    $(".menu_submit_button").addClass("menu_button_disabled");

    $(".loading_message").html("Načítání...");
    $(".loading_message").removeClass("hidden");
    $(".secs").addClass("hidden");

    loadLessons();
}); // checked
$(document).on("click", ".menu_save_button", function() {
    save();
});
$(document).on("click", ".menu_load_button", function() {
    $(".sch_load").trigger("click");
});
$(document).on("change", ".sch_load", function() {
    load();
});

// Schedule
$(document).on("click", ".schedule_cell_star", function() {
    if($(this).parent().css("border-left-style") === "solid") {
        $(this).parent().css("border-style", "dashed");
        scheduleIndexes = arrayRemove(scheduleIndexes, $(this).siblings(".day").html() + "|" +  $(this).siblings(".id").html());
    } else {
        $(this).parent().css("border-style", "solid");
        scheduleIndexes.push($(this).siblings(".day").html() + "|" + $(this).siblings(".id").html());
    }
    parseFinSchedule();
});
$(document).on("click", ".schedule_cell_bin", function() {
    if($(this).parent().hasClass("schedule_cell_deleted")) {
        $(this).parent().removeClass("schedule_cell_deleted");
        scheduleFaded = arrayRemove(scheduleFaded, $(this).siblings(".day").html() + "|" + $(this).siblings(".id").html());
    } else {
        $(this).parent().addClass("schedule_cell_deleted");
        scheduleFaded.push($(this).siblings(".day").html() + "|" + $(this).siblings(".id").html());

        $(this).parent().css("border-style", "dashed");
        scheduleIndexes = arrayRemove(scheduleIndexes, $(this).siblings(".day").html() + "|" + $(this).siblings(".id").html());
        parseFinSchedule();
    }
});
$(document).on("click", ".schedule_cell_bin_cc", function() {
    $(this).parent().remove();

    var scheduleToRemove;
    var id = $(this).siblings(".id").html();
    var day = +$(this).siblings(".day").html();
    $.each(scheduleCustom[day], function(i, sch) {
        if(sch.id === id) {
            scheduleToRemove = sch;
            return false;
        }
    });
    scheduleCustom[day] = arrayRemove(scheduleCustom[day], scheduleToRemove);

    parseSchedule();
});
$(document).on("click", ".sch_add_button", function() {
    addCustomSchedule();
});

///////////////////////////////////// Menu /////////////////////////////////////
function loadStudies(e) {
    // Title
    $(".loading_message").html("Načítám studia...");

    // AJAX
    $.ajax({
        url: "./load.php",
        method: "POST",
        data: {
            "a": "s",
            "b": "",
            "c": ""
        },
        async: false,
        success: function(e) {
            // Parse BIT
            {
                studies.push({
                    "name": "BIT",
                    "link": parseLinkforLoadPHP($(e).find("div#tab-bc").find("li.c-programmes__item").first().find("a.b-programme__link").prop("href")),
                    "subjects": {
                        "com": [
                            [], [], []
                        ],
                        "opt": [
                            [], [], []
                        ]
                    }
                });
            }

            // Parse MIT
            $(e).find("div#tab-mgr").find("li.c-programmes__item").first().find("li.c-branches__item").each(function(i, li) {
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
            $.each(studies, function(i, stud) {
                if(stud.name === "BIT") {
                    $(".menu_stud_column").append(` <div class="menu_column_row">
                                                        <input class="menu_column_row_checkbox menu_bit_checkbox" type="checkbox" value="` + stud.name + `">
                                                        <div class="menu_column_row_text">` + stud.name + `</div>
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

            // Load subjects
            loadSubjects();
        }
    });
} //checked

function loadSubjects(e) {
    // Parse
    $.each(studies, function(i, stud) {
        // Title
        $(".loading_message").html("Načítám předměty studia " + stud.name + "...");

        // AJAX
        $.ajax({
            url: "./load.php",
            method: "POST",
            data: {
                "a": "u",
                "b": stud.link.split("-")[0],
                "c": stud.link.split("-")[1]
            },
            async: false,
            success: function(e) {
                // Parse
                var sem = "winter";
                var grade = 0;
                $(e).find("main").first().find("div.table-responsive").first().find("tbody").each(function(o, tbody) {
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
            }
        });
    });

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
                                                <div class="menu_column_row_text_split">` + name + `</div>
                                                <div class="cleaner"></div>
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
                                                <div class="menu_column_row_text_split">` + name + `</div>
                                                <div class="cleaner"></div>
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
    $(".menu").removeClass("hidden");
    $(".secs").removeClass("hidden");
    $(".loading_message").html("");
    $(".loading_message").addClass("hidden");

    // Render
    renderSubjects();
} //checked
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
    $(".menu_sub_checkbox:checked").each(function(i, sub) {
        if(!$(sub).parent().hasClass("hidden")) {
            $(".menu_sel_column").append(`  <div class="menu_column_row">
                                                <input class="menu_column_row_checkbox menu_sel_checkbox" type="checkbox" value="` + $(sub).prop("value") + `" checked="checked">
                                                <div class="menu_column_row_text">` + $(sub).siblings(".menu_column_row_text").html() + `</div>
                                                <div class="cleaner"></div>
                                            </div>`);
        }
    });
} //checked

function loadLessons() {
    // Load selected
    subjects = [];
    $(".menu_sel_checkbox").each(function(i, sub) {
        subjects.push({
            "name": $(sub).siblings(".menu_column_row_text").html(),
            "link": $(sub).prop("value"),
            "range": ""
        });
    });

    // Parse
    lessons = [];
    ranges = [];
    $.each(subjects, function(i, sub) {
        // Title
        $(".loading_message").html("Načítám " + sub.name + "...");

        // AJAX
        $.ajax({
            url: "./load.php",
            method: "POST",
            data: {
                "a": "u",
                "b": sub.link.split("-")[0],
                "c": sub.link.split("-")[1]
            },
            async: false,
            success: function(e) {
                // Ranges
                sub.range = parseRange($(e).find("main").find("div.b-detail__body").find("div.grid__cell").find("p:contains('Rozsah')").parent().next().children().html());

                // Lessons
                $(e).find("table#schedule").find("tbody").find("tr").each(function(o, tr) {
                    if($(tr).children("td").eq(0).html().includes("přednáška") || $(tr).children("td").eq(0).html().includes("poč. lab") || $(tr).children("td").eq(0).html().includes("cvičení")) {
                        var lesson = {
                            "id": "",
                            "name": sub.name,
                            "link": sub.link,
                            "day":  parseDay($(tr).children("th").html()),
                            "week": parseWeek($(tr).children("td").eq(1).html()),
                            "from": parseTimeFrom($(tr).children("td").eq(3).html()),
                            "to":   parseTimeTo($(tr).children("td").eq(4).html()),
                            "type": "unknown",
                            "rooms": [],
                            "layer": 1,
                            "selected": false,
                            "deleted": false
                        };

                        // Type
                        if($(tr).children("td").eq(0).html() === "přednáška") {
                            lesson.type = "green";
                        } else if($(tr).children("td").eq(0).html() === "poč. lab" || $(tr).children("td").eq(0).html() === "cvičení") {
                            lesson.type = "blue";
                        }

                        // Rooms
                        $.each($(tr).children("td").eq(2).children("a"), function(p, a) {
                            lesson.rooms.push($(a).html());
                        });

                        // ID
                        lesson.id = "LOAD_" + makeHash(lesson.name + ";" + lesson.from + ";" + lesson.to + ";" + lesson.rooms + ";" + lesson.type + ";" + lesson.week + ";" + lesson.day);

                        // Push
                        lessons.push(lesson);
                    }
                });
            }
        });
    });

    // Sort
    lessons.sort(function(a, b) {
        if(a.type === "green" && b.type !== "green") {
            return -1;
        } else if(a.type !== "green" && b.type === "green") {
            return 1;
        }

        return 0;
    });

    // Done
    $(".menu_column_row_checkbox").prop("disabled", false);
    $(".menu_column_row_radio").prop("disabled", false);
    $(".menu_submit_button").prop("disabled", false);
    $(".menu_submit_button").removeClass("menu_button_disabled");

    $(".loading_message").html("");
    $(".loading_message").addClass("hidden");
    $(".secs").removeClass("hidden");

    // Parse schedule
    showRanges();
    parseSchedule();
    parseFinSchedule();
} //checked

////////////////////////////////// Schledules //////////////////////////////////
function showRanges() {
    // Ranges
    $.each(subjects, function(i, sub) {
        var green_value = 0;
        var blue_value = 0;
        var blue_count = 0;
        $.each(sub.range, function(o, ran) {
            if(ran.type === "přednášky") {
                green_value += ran.value;
            } else if(ran.type === "pc") {
                blue_value += ran.value;
            } else if(ran.type === "cvičení") {
                blue_value += ran.value;
            }
        });
        green_value /= 13;
        if(blue_value > 13) {
            blue_count = blue_value / 2;
        } else {
            blue_count = blue_value / 2;
        }
        if(blue_value > 1) {
            blue_value = 2
        }

        $(".ranges").append(`   <a target="_blank" href="https://www.fit.vut.cz/study/course/` + sub.link.split("-")[1] + `">
                                    <div class="range">
                                        <div class="range_name">` + sub.name + `</div>
                                        <div class="range_values">
                                            <div class="range_value">Přednášky: ` + green_value + ` hod. týdně</div>
                                            <div class="range_value">Cvičení: ` + blue_value + ` hod. týdně, ` + blue_count + `x</div>
                                        </div>
                                        <div class="cleaner"></div>
                                    </div>
                                </a>`);
    });
}
function parseSchedule() {
    // Push lessons
    schedule = [[], [], [], [], []];
    $.each(lessons, function(i, les) {
        // Collisions
        do {
            var collison = false;
            $.each(schedule[les.day], function(o, lesX) {
                if(lesX.layer === les.layer) {
                    if(areIntervalsColide(les.from, les.to, lesX.from, lesX.to)) {
                        collison = true;
                        les.layer++;
                        return false;
                    }
                }
            });
        } while(collison === true);

        // Push
        schedule[les.day].push(les);
    });

    // Render
    showSchedule();
}
function showSchedule() {
    // Layers count
    scheduleLayersCount = [0, 0, 0, 0, 0];
    for(d = 0; d < 5; d++) {
        var maxLayer = 0;
        $.each(schedule[d], function(i, les) {
            if(les.layer > maxLayer) {
                maxLayer = les.layer;
            }
        });
        scheduleLayersCount[d] = maxLayer
    }


    // Připravení rozvrhu
    for(d = 0; d < 5; d++) {
        $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").html("");
    }
    for(d = 0; d < 5; d++) {
        for(k = 0; k < scheduleLayersCount[d]; k++) {
            $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").append(`<div class="schedule_row_layer"></div>`);
        }
        if(scheduleLayersCount[d] != 0) {
            $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_header").css("line-height", (scheduleLayersCount[d] * 72) + "px");
        } else {
            $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_header").css("line-height", "72px");
        }
    }

    // Generování buněk
    for(d = 0; d < 5; d++) {
        var layersDiv = $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers");
        var fullLength = +$(layersDiv).width();

        $.each(schedule[d], function(i, sch) {
            var id = sch.id;
            var bin = "schedule_cell_bin";
            var length = ((sch.to - sch.from) * (fullLength / 14)) - 6 - 6;
            var left = (sch.from * (fullLength / 14)) + 3;
            var layer = sch.layer;
            var classes = "";
            var rooms = "";
            var groups = "";

            if(sch.type === "cc") {
                bin = "schedule_cell_bin_cc"
            }

            if(sch.type === "green") {
                classes += "schedule_cell_type_p ";
            } else if(sch.type === "blue") {
                classes += "schedule_cell_type_d ";
            }

            if(sch.week === "lichý") {
                classes += "schedule_cell_week_odd ";
            } else if(sch.week === "sudý") {
                classes += "schedule_cell_week_even ";
            }

            $.each(sch.rooms, function(i, room) {
                rooms += room + " ";
            });

            $(layersDiv).children(".schedule_row_layer").eq(layer - 1).append(`<div class="schedule_cell ` + classes + `" style="left: ` + left + `px; width: ` + length + `px">
                                                                                    <div class="schedule_cell_name"><a target="_blank" href="https://www.fit.vut.cz/study/course/` + sch.link + `">` + sch.name + `</a></div>
                                                                                    <div class="schedule_cell_rooms">` + rooms + `</div>
                                                                                    <div class="schedule_cell_desc">` + groups + `</div>
                                                                                    <div class="schedule_cell_star"></div>
                                                                                    <div class="` + bin + `"></div>
                                                                                    <div class="id hidden">` + id + `</div>
                                                                                    <div class="day hidden">` + d + `</div>
                                                                            </div>`)
        });
    }
}




function addCustomSchedule() {
    var lesson = {
        id: Date.now(),
        url: "",
        name: $(".sch_add_name").val(),
        from: +$(".sch_add_from").val(),
        to: +$(".sch_add_to").val(),
        groups: [],
        rooms: [$(".sch_add_room").val()],
        type: "cc",
        week: $(".sch_add_weeks").val(),
        layer: -1,
        real: true,
        visible: true
    };

    if(lesson.from >= lesson.to) {
        return;
    }
    if(typeof lesson.name === "undefined" || lesson.name === "") {
        return;
    }
    if(typeof lesson.rooms[0] === "undefined" || lesson.rooms[0] === "") {
        return;
    }


    if(+$(".sch_add_day").val() === 1) {
        scheduleCustom[0].push(lesson);
    } else if(+$(".sch_add_day").val() === 2) {
        scheduleCustom[1].push(lesson);
    } else if(+$(".sch_add_day").val() === 3) {
        scheduleCustom[2].push(lesson);
    } else if(+$(".sch_add_day").val() === 4) {
        scheduleCustom[3].push(lesson);
    } else if(+$(".sch_add_day").val() === 5) {
        scheduleCustom[4].push(lesson);
    }

    parseSchedule();
}
function parseFinSchedule() {
    scheduleFin = [[], [], [], [], []];
    scheduleFinLayersCount = [0, 0, 0, 0, 0];

    var scheduleToRemove = [];
    $.each(scheduleIndexes, function(i, index) {
        var found = false;
        var day = +index.split("|")[0];
        var id = index.split("|")[1];

        $.each(schedule[day], function(i, sch) {
            if(sch.id.toString() === id.toString()) {
                found = true;
                scheduleFin[day].push(sch);
                $(".id:contains(" + id +")").parent().css("border-style", "solid");

                return false;
            }
        });
        if(!found) {
            scheduleToRemove.push(index);
        }
    });
    $.each(scheduleToRemove, function(i, index) {
        scheduleIndexes = arrayRemove(scheduleIndexes, index);
    });

    scheduleToRemove = [];
    $.each(scheduleFaded, function(i, index) {
        var found = false;
        var day = +index.split("|")[0];
        var id = index.split("|")[1];

        $.each(schedule[day], function(i, sch) {
            if(sch.id.toString() === id.toString()) {
                found = true;
                $(".id:contains(" + id +")").parent().addClass("schedule_cell_deleted");

                return false;
            }
        });
        if(!found) {
            scheduleToRemove.push(index);
        }
    });
    $.each(scheduleToRemove, function(i, index) {
        scheduleFaded = arrayRemove(scheduleFaded, index);
    });

    // vrstvy
    for(d = 0; d < 5; d++) {
        $.each(scheduleFin[d], function(i, sch) {
            sch.layer = -1;
            var layer = 1;
            var noCollison = false;

            while(noCollison === false) {
                noCollison = true;
                $.each(scheduleFin[d], function(p, schX) {
                    if(schX.layer === layer) {
                        if(areIntervalsColide(sch.from, sch.to, schX.from, schX.to)) {
                            noCollison = false;
                            layer++;
                            return false;
                        }
                    }
                });
            }
            sch.layer = layer;
        });
    }

    // počet vrstev
    for(d = 0; d < 5; d++) {
        var maxLayer = 0;

        $.each(scheduleFin[d], function(i, sch) {
            if(sch.layer > maxLayer) {
                maxLayer = sch.layer;
            }
        });

        scheduleFinLayersCount[d] = maxLayer;
    }

    showFinSchedule();
}
function showFinSchedule() {
    for(d = 0; d < 5; d++) {
        $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").html("");
    }
    for(d = 0; d < 5; d++) {
        for(k = 0; k < scheduleFinLayersCount[d]; k++) {
            $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").append(`<div class="schedule_row_layer"></div>`);
        }
        if(scheduleFinLayersCount[d] != 0) {
            $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_header").css("line-height", (scheduleFinLayersCount[d] * 72) + "px");
        } else {
            $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_header").css("line-height", "72px");
        }
    }

    for(d = 0; d < 5; d++) {
        var layersDiv = $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers");
        var fullLength = +$(layersDiv).width();

        $.each(scheduleFin[d], function(k, sch) {
            var length = ((sch.to - sch.from) * (fullLength / 14)) - 6 - 6;
            var left = (sch.from * (fullLength / 14)) + 3;
            var layer = sch.layer;
            var classes = "";
            var rooms = "";
            var groups = "";

            if(sch.type === "p") {
                classes += "schedule_cell_type_p ";
            } else if(sch.type === "c" || sch.type === "cc") {
                classes += "schedule_cell_type_c ";
            } else if(sch.type === "d") {
                classes += "schedule_cell_type_d ";
            }

            if(sch.week === "lichý") {
                classes += "schedule_cell_week_odd ";
            } else if(sch.week === "sudý") {
                classes += "schedule_cell_week_even ";
            }

            $.each(sch.rooms, function(i, room) {
                rooms += room + " ";
            });
            $.each(sch.groups, function(i, group) {
                if(group[3] === "A") {
                    groups += "<span class='red'>" + group + "</span> ";
                } else if(group[3] === "B") {
                    groups += "<span class='blue'>" + group + "</span> ";
                } else {
                    groups += group + " ";
                }
            });

            $(layersDiv).children(".schedule_row_layer").eq(layer - 1).append(`<div class="schedule_cell schedule_cell_selected ` + classes + `" style="left: ` + left + `px; width: ` + length + `px">
                                                                                    <div class="schedule_cell_name">` + sch.name + `</div>
                                                                                    <div class="schedule_cell_rooms">` + rooms + `</div>
                                                                                    <div class="schedule_cell_desc">` + groups + `</div>
                                                                               </div>`)
        });
    }
}

//////////////////////////////////// SAVING ////////////////////////////////////
function save() {
    var file = {
        grades: [],
        sem: undefined,
        com_sub: [],
        opt_sub: [],
        custom: [],
        faded: [],
        indexes: []
    }
    $.each($(".menu_column_row_checkbox[name='grade']:checked"), function(i, gr) {
        file.grades.push($(gr).prop("value"));
    });
    file.sem = +$(".menu_column_row_radio[name='sem']:checked").prop("value");

    $.each($(".menu_com_column .menu_column_row"), function(i, sub) {
        if($(sub).children(".menu_column_row_checkbox").length != 0) {
            if($(sub).children(".menu_column_row_checkbox")[0].checked) {
                file.com_sub.push($(sub).children(".menu_column_row_text").html());
            }
        }
    });
    $.each($(".menu_opt_column .menu_column_row"), function(i, sub) {
        if($(sub).children(".menu_column_row_checkbox").length != 0) {
            if($(sub).children(".menu_column_row_checkbox")[0].checked) {
                file.opt_sub.push($(sub).children(".menu_column_row_text").html());
            }
        }
    });

    var scheduleToRemove = [];
    $.each(scheduleFaded, function(i, index) {
        var found = false;
        var day = +index.split("|")[0];
        var id = index.split("|")[1];

        $.each(schedule[day], function(i, sch) {
            if(sch.id.toString() === id.toString()) {
                found = true;
                return false;
            }
        });
        if(!found) {
            scheduleToRemove.push(index);
        }
    });
    $.each(scheduleToRemove, function(i, index) {
        scheduleFaded = arrayRemove(scheduleFaded, index);
    });

    file.custom = scheduleCustom;
    file.faded = scheduleFaded;
    file.indexes = scheduleIndexes;

    file = JSON.stringify(file);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(file));
    element.setAttribute('download', "schledule.json");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
function load() {
    var file;
    if(!$(".sch_load")[0].files[0]) {
        $(".loading_message").html("Nevybrán žádný soubor");
    }

    var reader = new FileReader();
    reader.readAsText($(".sch_load")[0].files[0], "UTF-8");
    reader.onload = function (e) {
        try {
            file = JSON.parse(e.target.result);
        } catch(e) {
            $(".loading_message").html("Chyba při parsování souboru");
        }

        $.each($(".menu_column_row_checkbox[name='grade']"), function(i, gr) {
            if(file.grades.includes($(gr).prop("value"))) {
                $(gr).prop("checked", true);
            } else {
                $(gr).prop("checked", false);
            }
        });
        if(file.sem === 0) {
            $(".menu_column_row_radio[name='sem'][value='0']").prop("checked", true);
        } else {
            $(".menu_column_row_radio[name='sem'][value='1']").prop("checked", true);
        }

        $.each($(".menu_com_column .menu_column_row"), function(i, sub) {
            if(file.com_sub.includes($(sub).children(".menu_column_row_text").html())) {
                $(sub).children("input").prop("checked", true);
            } else {
                $(sub).children("input").prop("checked", false);
            }
        });
        $.each($(".menu_opt_column .menu_column_row"), function(i, sub) {
            if(file.opt_sub.includes($(sub).children(".menu_column_row_text").html())) {
                $(sub).children("input").prop("checked", true);
            } else {
                $(sub).children("input").prop("checked", false);
            }
        });

        scheduleCustom = file.custom;
        scheduleFaded = file.faded;
        scheduleIndexes = file.indexes;

        $(".header_menu_icon").css("background-image", "url(./images/menu.png)")
        $(".menu").addClass("hidden");
        renderSubjects();
        loadWorkingSubjects();
    }
    reader.onerror = function (e) {
        $(".loading_message").html("Chyba při čtení souboru");
    }
}

//////////////////////////////////// Helpers ///////////////////////////////////
function parseLinkforLoadPHP(link) {
    var linkArray = link.split("/");
    linkArray.pop("");
    return linkArray[linkArray.length - 2] + "-" + linkArray[linkArray.length - 1];
} //checked
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
} //checked
function parseWeek(week) {
    week = week.replace("výuky", "");
    week = week.replaceAll(",", "");
    week = week.trim();
    return week;
} //checked
function parseTimeFrom(time) {
    var hours = +time.split(":")[0];
    return hours - 7;
} //checked
function parseTimeTo(time) {
    var hours = +time.split(":")[0] + 1;
    return hours - 7;
} //checked
function parseRange(rangeString) {
    rangeString = rangeString.replaceAll("\\n", "");
    rangeString = rangeString.replaceAll("hod. ", "");
    rangeString = rangeString.trim();

    ranges = [];
    $.each(rangeString.split(","), function(i, rang) {
        rang = rang.trim();

        ranges.push({
            "type": rang.split(" ")[1],
            "value": +rang.split(" ")[0]
        });
    });
    return ranges;
} //checked
function areIntervalsColide(a, b, x, y) {
    a *= 10;
    b *= 10;
    x *= 10;
    y *= 10;

    for(o = a + 5; o < b; o += 10) {
        for(p = x + 5; p < y; p += 10) {
            if(o === p) {
                return true;
            }
        }
    }
    return false;
} //checked
function arrayRemove(array, value) {
    return array.filter(function(element) {
        return element != value;
    });
}
function arrayEqual(arrayA, arrayB) {
    if(arrayA.length != arrayB.length) {
        return false;
    }

    for(i = 0; i < arrayA.length; i++) {
        if(!arrayB.includes(arrayA[i])) {
            return false;
        }
    }
    return true;
}
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
}; //checked
