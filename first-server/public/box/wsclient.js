var app;
var ws;

function Init() {
    app = new Vue({
        el: "#app",
        data: {
            client_count: 0,
            new_message: "",
            chat_messages: []
        }
    });

    var port = window.location.port || "80";
    ws = new WebSocket("ws://" + window.location.hostname + ":" + port);
    ws.onopen = (event) => {
        console.log("Connection successful!");
    };
    ws.onmessage = (event) => {
        console.log(event.data);
        var message = JSON.parse(event.data);
        if (message.msg === "client_count") {
            app.client_count = message.data;
        }
        else if (message.msg === "text") {
            app.chat_messages.push(message.data);
        }
    };
}

function SendMessage() {

    ws.send( app.client_count+":"+sessionStorage.getItem("name") +": "+app.new_message );
}

