cmake_minimum_required(VERSION 3.21)
project(booth_bridge LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Option to enable/disable Sony SDK integration (disabled by default for stub builds)
option(ENABLE_SONY_SDK "Enable Sony Camera Remote SDK integration" OFF)

# Create shared library (DLL on Windows)
add_library(booth_bridge SHARED
  src/booth_bridge.cpp
)

target_include_directories(booth_bridge PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>
)

# Compiler options
target_compile_features(booth_bridge PUBLIC cxx_std_17)

if(MSVC)
  target_compile_options(booth_bridge PRIVATE
    /W4
    /WX-
    /EHsc
    /MP
  )
else()
  target_compile_options(booth_bridge PRIVATE
    -Wall
    -Wextra
    -Wpedantic
  )
endif()

# Windows-specific settings
if(WIN32)
  target_compile_definitions(booth_bridge PRIVATE
    _CRT_SECURE_NO_WARNINGS
    NOMINMAX
    WIN32_LEAN_AND_MEAN
  )
endif()

# Sony SDK Integration (when enabled)
if(ENABLE_SONY_SDK)
  # Path to Sony SDK - adjust based on your installation
  set(SONY_SDK_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../REF/CrSDK_v2.01.00_20260203a_Win64"
      CACHE PATH "Path to Sony Camera Remote SDK")

  if(EXISTS ${SONY_SDK_ROOT})
    # Add Sony SDK include directories
    target_include_directories(booth_bridge PRIVATE
      ${SONY_SDK_ROOT}/include
    )

    # Link Sony SDK libraries
    target_link_directories(booth_bridge PRIVATE
      ${SONY_SDK_ROOT}/lib
    )

    # Link required libraries
    target_link_libraries(booth_bridge PRIVATE
      CrSDK  # Main Sony SDK library
    )

    target_compile_definitions(booth_bridge PRIVATE
      SONY_SDK_ENABLED
    )

    message(STATUS "Sony Camera Remote SDK enabled: ${SONY_SDK_ROOT}")
  else()
    message(WARNING "Sony SDK not found at ${SONY_SDK_ROOT}, building in stub mode")
  endif()
else()
  message(STATUS "Building booth_bridge in stub mode (Sony SDK disabled)")
endif()

# Set output name and properties
set_target_properties(booth_bridge PROPERTIES
  OUTPUT_NAME "booth_bridge"
  RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
  LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib
  ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib
)

# Installation
install(TARGETS booth_bridge
  RUNTIME DESTINATION bin
  LIBRARY DESTINATION lib
  ARCHIVE DESTINATION lib
)

install(FILES include/booth_bridge.h DESTINATION include)
