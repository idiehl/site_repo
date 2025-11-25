$(document).ready(function(){
    $("button").click(function(){
        $("p").hide();
    });
});

$(document).ready(function(){
    $("#btn1").click(function(){
        $("#test1").text(function(i, origText){
            return "Old text: " + origText + " New text: Hello world! (index: " + i + ")";
        });
    });
});

$(document).ready(function(){
    $("button").click(function(){
        $("#w3s").attr("href", "https://www.w3schools.com/jquery/");
    });
});

$(document).ready(function(){
    $("#btn1").click(function(){
        $("img").before("<b>Before</b>");
    });

    $("#btn2").click(function(){
        $("img").after("<i>After</i>");
    });
});

$("button").click(function(){
    $("#w3s").attr({
        "href" : "https://www.w3schools.com/jquery/",
        "title" : "W3Schools jQuery Tutorial"
    });
});

$("button").click(function(){
    $("#w3s").attr("href", function(i, origValue){
        return origValue + "/jquery/";
    });
});

function appendText() {
    var txt1 = "<p>Text.</p>";               // Create element with HTML
    var txt2 = $("<p></p>").text("Text.");   // Create with jQuery
    var txt3 = document.createElement("p");  // Create with DOM
    txt3.innerHTML = "Text.";
    $("body").append(txt1, txt2, txt3);      // Append the new elements
}

$(document).ready(function(){
    $("button").click(function(){
        $("#div1").empty();
    });
});

$(document).ready(function(){
    $("button").click(function(){
        $("#div1").remove();
    });
});

$(document).ready(function(){
    $("button").click(function(){
        $("p").remove(".test, .demo");
    });
});

$(document).ready(function(){
    $("button").click(function(){
        $("h1, h2, p").addClass("blue");
        $("div").addClass("important");
    });
});

$(document).ready(function(){
    $("button").click(function(){
        $("p").css("background-color", "yellow", "font-size": "200%");
    });
});

$(document).ready(function(){
    $("span").parents("p").css({"color": "red", "border": "2px solid red"});
});

$(document).ready(function(){
    $("span").parentsUntil("div");
});

$(document).ready(function(){
    $("div").children("p.first").css({"color": "red", "border": "2px solid red"});
});

$(document).ready(function(){
    $("div").find("span").css({"color": "red", "border": "2px solid red"});
});

$(document).ready(function(){
    $("p").eq(1);
});

$(document).ready(function(){
    $("p").filter(".intro");
});

$(document).ready(function(){
    $("p").not(".intro");
});

$(document).ready(function(){
    $("button").click(function(){
        $("#div1").load("demo_test.txt");
    });
});

$("#div1").load("demo_test.txt #p1");

$("button").click(function(){
    $.get("demo_test.asp", function(data, status){
        alert("Data: " + data + "\nStatus: " + status);
    });
});

$.post(URL,data,callback);

$("button").click(function(){
    $.post("demo_test_post.asp",
    {
        name: "Donald Duck",
        city: "Duckburg"
    },
    function(data, status){
        alert("Data: " + data + "\nStatus: " + status);
    });
});