cmake_minimum_required(VERSION 3.10)
project(Bomb)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Include
include_directories(
    include
)

# Sorgenti
set(SOURCES
    main.cpp

    src/ApiManager.cpp
    src/Lobby.cpp
)

# Eseguibile
add_executable(bomb ${SOURCES})

# Flags di compilazione (warning)
target_compile_options(bomb PRIVATE
    -Wall
    -Wextra
    -Wpedantic
)