<?php
    header("Access-Control-Allow-Origin: *");
    $opts = [
        "http" => [
            "method" => "GET",
            "header" => "Accept-language: cs\r\n"
        ]
    ];
    $context = stream_context_create($opts);

    if(isset($_POST)) {
        if(isset($_POST["a"]) && isset($_POST["b"]) && isset($_POST["c"])) {
            if($_POST["a"] === "s") {
                echo file_get_contents("https://www.fit.vut.cz/study/programs/" . (isset($_POST["y"]) ? ("?year=" . intval($_POST["y"])) : ""), false, $context);
            } else if($_POST["a"] === "u") {
                if(ctype_alnum($_POST["b"]) && is_numeric($_POST["c"])) {
                    echo file_get_contents("https://www.fit.vut.cz/study/" . urlencode($_POST["b"]) . "/" . intval($_POST["c"]), false, $context);
                }
            }
        }
    }

    echo "";
?>
