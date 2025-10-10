#pragma once
#include <string>

class ApiManager {
public:
    ApiManager(const std::string& serverUrl, int port);

    std::string sendHttpRequest(const std::string& endpoint, const std::string& jsonBody);

    // --- WebSocket ---
    void connectWebSocket(const std::string& endpoint);
    void sendWebSocketMessage(const std::string& message);
    void closeWebSocket();

    // --- Token / ID management ---
    void setAuthToken(const std::string& token);
    std::string getAuthToken() const;

private:
    std::string serverUrl;
    int port;
    std::string authToken;

    std::unique_ptr<WebSocketClient> wsClient;
};