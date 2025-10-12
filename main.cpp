#include <App.h>
#include <fstream>
#include <iostream>
#include <string>

struct PerConnection {};

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

int main() {
    uWS::App()
    // Serve qualunque file dalla cartella frontend
    .get("/*", [](auto *res, auto *req){
        std::string url = std::string(req->getUrl());
        std::string path = "../frontend" + url;
        if (url.back() == '/') path += "index.html"; // fallback a index.html

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
        .open = [](auto *ws){ std::cout << "Nuova connessione\n"; },
        .message = [](auto *ws, std::string_view msg, uWS::OpCode op){ ws->send(msg, op); },
        .close = [](auto *ws, int, std::string_view){ std::cout << "Connessione chiusa\n"; }
    })
    .listen(9002, [](auto *token){ 
        if(token) std::cout << "Server attivo su http://localhost:9002/\n"; 
    })
    .run();
}

