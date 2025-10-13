#pragma once
#include <string>

class Player {
    private:
        float x, y, z;
        float rotation;
        int health;
    public:
        Player();
        ~Player();
        void moveLeft();
        void moveRight();
        void jump();
        void moveBack();
        void moveForward();
        void attack();
        std::string getStats();
};