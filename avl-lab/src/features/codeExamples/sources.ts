import cSource from '../../../public/code/avl_tree.c?raw';
import cppSource from '../../../public/code/avl_tree.cpp?raw';

export type Lang = 'c' | 'cpp';

export const SOURCES: Record<Lang, { label: string; filename: string; text: string; compile: string; compileStrict: string; run: string; runWin: string; mime: string }> = {
  c: {
    label: 'C',
    filename: 'avl_tree.c',
    text: cSource.replace(/\r\n/g, '\n'),
    compile: 'gcc avl_tree.c -o avl_tree',
    compileStrict: 'gcc -std=c99 -Wall -Wextra -pedantic avl_tree.c -o avl_tree',
    run: './avl_tree',
    runWin: 'avl_tree.exe',
    mime: 'text/x-csrc',
  },
  cpp: {
    label: 'C++',
    filename: 'avl_tree.cpp',
    text: cppSource.replace(/\r\n/g, '\n'),
    compile: 'g++ avl_tree.cpp -o avl_tree',
    compileStrict: 'g++ -std=c++11 -Wall -Wextra -pedantic avl_tree.cpp -o avl_tree',
    run: './avl_tree',
    runWin: 'avl_tree.exe',
    mime: 'text/x-c++src',
  },
};
