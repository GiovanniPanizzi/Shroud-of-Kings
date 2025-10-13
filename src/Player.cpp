#include "Player.hpp"
#include <cmath>

Player::Player() : x(0), y(0), z(0), rotation(0), health(100) {}

Player::~Player() {}
void Player::moveLeft() { x -= 0.3; }
void Player::moveRight() { x += 0.3; }
void Player::jump() { y += 0.3f; }
void Player::moveBack() { z -= 0.3f; }
void Player::moveForward() { z += 0.3f; }
void Player::attack() { health -= 10; if (health < 0) health = 0; }
std::string Player::getStats() {
    return std::to_string(x) + ", " + std::to_string(y) + ", " + std::to_string(z) + ",";
}
