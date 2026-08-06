#
# Generated file, do not edit.
#

list(APPEND FLUTTER_PLUGIN_LIST
  cloud_firestore
  firebase_core
  geolocator_windows
<<<<<<< HEAD
  sqlite3_flutter_libs
=======
>>>>>>> d94f355c7bf354077a3790131a2352b4a545abf4
  url_launcher_windows
)

list(APPEND FLUTTER_FFI_PLUGIN_LIST
<<<<<<< HEAD
  jni
=======
>>>>>>> d94f355c7bf354077a3790131a2352b4a545abf4
)

set(PLUGIN_BUNDLED_LIBRARIES)

foreach(plugin ${FLUTTER_PLUGIN_LIST})
  add_subdirectory(flutter/ephemeral/.plugin_symlinks/${plugin}/windows plugins/${plugin})
  target_link_libraries(${BINARY_NAME} PRIVATE ${plugin}_plugin)
  list(APPEND PLUGIN_BUNDLED_LIBRARIES $<TARGET_FILE:${plugin}_plugin>)
  list(APPEND PLUGIN_BUNDLED_LIBRARIES ${${plugin}_bundled_libraries})
endforeach(plugin)

foreach(ffi_plugin ${FLUTTER_FFI_PLUGIN_LIST})
  add_subdirectory(flutter/ephemeral/.plugin_symlinks/${ffi_plugin}/windows plugins/${ffi_plugin})
  list(APPEND PLUGIN_BUNDLED_LIBRARIES ${${ffi_plugin}_bundled_libraries})
endforeach(ffi_plugin)
