#include <App.h>
#include <fstream>
#include <iostream>
#include <string>
#include "Player.hpp"

struct PerConnection {Player* player;};

bool endsWith(const std::string &str, const std::string &suffix) {
    return str.size() >= suffix.size() &&
           str.compare(str.size() - suffix.size(), suffix.size(), suffix) == 0;
}

std::string getContentType(const std::string &path) {
    if (endsWith(path, ".html")) return "text/html; charset=utf-8";
    if (endsWith(path, ".css")) return "text/css";
    if (endsWith(path, ".js")) return "application/javascript";
    if (endsWith(path, ".png")) return "image/png";
    if (endsWith(path, ".jpg") || endsWith(path, ".jpeg")) return "image/jpeg";
    if (endsWith(path, ".glb")) return "model/gltf-binary";
    return "text/plain";
}

std::vector<std::string> parseMosse(const std::string& input) {
    std::vector<std::string> mosse;
    size_t start = 0;
    size_t end = input.find('/');
    while (end != std::string::npos) {
        mosse.push_back(input.substr(start, end - start));
        start = end + 1;
        end = input.find('/', start);
    }
    mosse.push_back(input.substr(start));
    if (mosse.size() != 5) {
        std::cerr << "Attenzione: il numero di mosse non è 5!\n";
    }
    return mosse;
}

int main() {
    uWS::App()
    // Serve file statici
    .get("/*", [](auto *res, auto *req){
        std::string url = std::string(req->getUrl());
        std::string path = "../frontend" + url;
        if (url.back() == '/') path += "index.html";

        std::ifstream file(path, std::ios::binary);
        if (file.is_open()) {
            std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
            res->writeHeader("Content-Type", getContentType(path));
            res->end(content);
        } else {
            res->writeStatus("404 Not Found");
            res->end("File non trovato: " + path);
        }
    })

    // WebSocket
    .ws<PerConnection>("/*", {
        .open = [](auto *ws) {
            std::cout << "Nuova connessione\n";
            auto *data = (PerConnection*) ws->getUserData();
            data->player = new Player();
        },

        .message = [](auto *ws, std::string_view msg, uWS::OpCode op) {
            auto *data = (PerConnection*) ws->getUserData();
            std::cout << "Ricevuto: " << msg << "\n";

            // Puoi aggiornare la posizione del player
            // esempio semplice:
            if (msg == "move_forward;")  data->player->moveForward();
            if (msg == "move_backward;")     data->player->moveBack();
            if (msg == "move_left;")     data->player->moveLeft();
            if (msg == "move_right;")    data->player->moveRight();

            std::string risposta = data->player->getStats();
            ws->send(risposta, op);
        },

        .close = [](auto *ws, int, std::string_view) {
            auto *data = (PerConnection*) ws->getUserData();
            delete data->player;
            std::cout << "Connessione chiusa\n";
        }
    })

    .listen(9002, [](auto *token){
        if (token) std::cout << "Server attivo su http://localhost:9002/\n";
    })
    .run();
}

