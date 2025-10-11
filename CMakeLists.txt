cmake_minimum_required(VERSION 3.15)
project(Bomb)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include_directories(
    include
    external/uWebSockets/src
    external/uWebSockets/uSockets/src
)

add_definitions(-DLIBUS_USE_OPENSSL)

set(SOURCES
    main.cpp
    src/ApiManager.cpp
    src/Lobby.cpp
)

add_executable(bomb ${SOURCES})

# --- uSockets ---
file(GLOB_RECURSE USOCKETS_SOURCES
    external/uWebSockets/uSockets/src/*.c
    external/uWebSockets/uSockets/src/*.cpp
)

add_library(usockets STATIC ${USOCKETS_SOURCES})
target_include_directories(usockets PRIVATE external/uWebSockets/uSockets/src)

# --- macOS: OpenSSL ---
if(APPLE)
    execute_process(
        COMMAND brew --prefix openssl@3
        OUTPUT_VARIABLE OPENSSL_PREFIX
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )

    set(OPENSSL_INCLUDE_DIR "${OPENSSL_PREFIX}/include")
    set(OPENSSL_LIB_DIR "${OPENSSL_PREFIX}/lib")

    include_directories(${OPENSSL_INCLUDE_DIR})
    link_directories(${OPENSSL_LIB_DIR})
endif()

target_link_libraries(bomb PRIVATE
    usockets
    ${OPENSSL_LIB_DIR}/libssl.dylib
    ${OPENSSL_LIB_DIR}/libcrypto.dylib
    z
)

target_compile_options(bomb PRIVATE
    -Wall
    -Wextra
    -Wpedantic
    -O2
)
