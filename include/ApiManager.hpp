#pragma once
#include <string>
#include <App.h>

class ApiManager {
public:
    ApiManager(const std::string& host, int port);
    ~ApiManager();

    std::string sendHttpRequest(const std::string& endpoint, const std::string& jsonBody);

    void connectWebSocket(const std::string& endpoint);
    void sendWebSocketMessage(const std::string& message);
    void closeWebSocket();

    void run(); 

    void setAuthToken(const std::string& token);
    std::string getAuthToken() const;

private:
    uWS::App app;                     
    uWS::WebSocket<false, false, void>* wsClient = nullptr;

    std::string host;
    int port;

    std::string authToken;
};