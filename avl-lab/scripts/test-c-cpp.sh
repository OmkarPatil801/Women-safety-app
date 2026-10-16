#!/usr/bin/env bash
# Compile both programs with warnings-as-errors and run a quick demo session.
set -euo pipefail
cd "$(dirname "$0")/../public/code"
out="$(mktemp -d)"
gcc -std=c99 -Wall -Wextra -pedantic -Werror avl_tree.c -o "$out/c_avl"
g++ -std=c++11 -Wall -Wextra -pedantic -Werror avl_tree.cpp -o "$out/cpp_avl"
printf '1\n30\n1\n20\n1\n10\n8\n4\n0\n' | "$out/c_avl" | tail -12
printf '1\n30\n1\n20\n1\n10\n8\n4\n0\n' | "$out/cpp_avl" | tail -12
rm -rf "$out"
echo "C and C++ OK"
